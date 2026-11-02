import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import KnowledgeBaseDoc from "../models/KnowledgeBaseDoc.js";
import KnowledgeBaseChunk from "../models/KnowledgeBaseChunk.js";
import {
  getChromaHealthError,
  getReferenceCollection,
  markChromaFailure,
  probeChroma,
} from "../config/chroma.js";
import { embedBatch } from "./embeddingService.js";
import { splitText } from "./chunkingService.js";
import { downloadPrivatePdf } from "./cloudinaryService.js";
import { extractText } from "./ocrService.js";

const idString = (value) => String(value?._id || value?.id || value);
let processingQueue = Promise.resolve();

function cleanPageText(text) {
  return String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

export function selectPagesNeedingOcr(pages, minimumTextLength = 30) {
  return pages
    .flatMap((page, index) =>
      cleanPageText(page.text).length < minimumTextLength
        ? [Number(page.num) || index + 1]
        : []
    );
}

export async function removeMedicalDocumentChunks(docId) {
  const documentId = idString(docId);
  await KnowledgeBaseChunk.deleteMany({ documentId });
  if (await probeChroma()) {
    const collection = await getReferenceCollection();
    await collection.delete({ where: { docId: documentId } });
  }
}

async function extractPageChunks(buffer, reportProgress) {
  const parser = new PDFParse({ data: buffer });
  let pages;
  try {
    const result = await parser.getText();
    pages = result.pages || [];
  } finally {
    await parser.destroy?.();
  }

  const textByPage = new Map();
  for (const [index, page] of pages.entries()) {
    const pageNumber = Number(page.num) || index + 1;
    const text = cleanPageText(page.text);
    if (text.length >= 30) textByPage.set(pageNumber, text);
  }

  const pagesNeedingOcr = selectPagesNeedingOcr(pages);
  if (pagesNeedingOcr.length) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "medimind-kb-"));
    const pdfPath = path.join(tempDir, "source.pdf");
    try {
      await fs.writeFile(pdfPath, buffer, { flag: "wx" });
      const ocrResult = await extractText(pdfPath, "application/pdf", {
        pageNumbers: pagesNeedingOcr,
        onProgress: ({ completed, total, pass }) => reportProgress({
          stage: "ocr",
          completed,
          total,
          pass,
        }),
      });
      if (ocrResult.error) throw new Error(ocrResult.error);
      const ocrPages = Array.isArray(ocrResult.pageTexts) ? ocrResult.pageTexts : [];
      ocrPages.forEach((text, index) => {
        const pageNumber = ocrResult.pageNumbers?.[index] || pagesNeedingOcr[index];
        const cleaned = cleanPageText(text);
        if (cleaned) textByPage.set(pageNumber, cleaned);
      });
      if (!textByPage.size) {
        throw new Error(ocrResult.error || "No readable text was found in the PDF.");
      }
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  const chunks = [];
  await reportProgress({ stage: "chunking", completed: 0, total: pages.length });
  for (const [index, page] of pages.entries()) {
    const pageNumber = Number(page.num) || index + 1;
    const text = textByPage.get(pageNumber) || "";
    if (text) {
      const pageChunks = await splitText(text);
      pageChunks.forEach((pageContent) => chunks.push({ pageContent, pageNumber }));
    }
    await reportProgress({ stage: "chunking", completed: index + 1, total: pages.length });
  }
  return chunks;
}

export async function indexMedicalDocument(doc, reportProgress) {
  const docId = idString(doc);
  let collection;
  try {
    await reportProgress({ stage: "downloading", completed: 0, total: 0 });
    const pdf = await downloadPrivatePdf({
      publicId: doc.cloudinaryPublicId,
      format: doc.cloudinaryFormat,
      resourceType: doc.cloudinaryResourceType,
    });
    await reportProgress({ stage: "extracting", completed: 0, total: 0 });
    const chunks = await extractPageChunks(pdf, reportProgress);
    if (!chunks.length) throw new Error("No readable text was found in the PDF.");

    await reportProgress({ stage: "indexing", completed: 0, total: chunks.length });
    await KnowledgeBaseChunk.deleteMany({ documentId: doc._id });
    await KnowledgeBaseChunk.insertMany(
      chunks.map((chunk, chunkIndex) => ({
        documentId: doc._id,
        chunkIndex,
        pageNumber: chunk.pageNumber,
        content: chunk.pageContent,
      }))
    );
    await KnowledgeBaseDoc.updateOne(
      { _id: doc._id, status: "PROCESSING" },
      { $set: { chunks: chunks.length } }
    );

    if (!(await probeChroma())) {
      console.warn(
        `[medicalKnowledgeBase] Chroma unavailable (${getChromaHealthError() || "health check failed"}); ` +
          `indexed ${docId} for MongoDB text retrieval`
      );
      await reportProgress({ stage: "indexing", completed: chunks.length, total: chunks.length });
      return { chunks: chunks.length, searchBackend: "mongodb" };
    }

    try {
      await reportProgress({ stage: "embedding", completed: 0, total: chunks.length });
      let lastProgressUpdate = 0;
      const embeddings = await embedBatch(
        chunks.map((chunk) => chunk.pageContent),
        undefined,
        async ({ completed, total }) => {
          if (completed - lastProgressUpdate >= 32 || completed === total) {
            lastProgressUpdate = completed;
            await reportProgress({ stage: "embedding", completed, total });
          }
        }
      );
      if (embeddings.length !== chunks.length || embeddings.some((embedding) => !embedding?.length)) {
        throw new Error("Embedding generation returned incomplete results.");
      }

      collection = await getReferenceCollection();
      await reportProgress({ stage: "indexing", completed: 0, total: chunks.length });
      await collection.delete({ where: { docId } });
      const title = doc.title || "Medical reference";
      const UPSERT_BATCH_SIZE = 128;
      for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
        const end = Math.min(start + UPSERT_BATCH_SIZE, chunks.length);
        const batchIndexes = Array.from({ length: end - start }, (_, offset) => start + offset);
        await collection.upsert({
          ids: batchIndexes.map((index) => `${docId}_${index}`),
          embeddings: embeddings.slice(start, end),
          documents: chunks.slice(start, end).map((chunk) => chunk.pageContent),
          metadatas: chunks.slice(start, end).map((chunk, offset) => {
            const index = start + offset;
            return {
              docId,
              title,
              publisher: doc.sourceOrganization || "",
              sourceOrganization: doc.sourceOrganization || "",
              sourceUrl: doc.sourceUrl || "",
              category: doc.category || "",
              language: doc.language || "",
              version: doc.version || "",
              pageNumber: chunk.pageNumber,
              chunkIndex: index,
              totalChunks: chunks.length,
              docType: "reference",
              status: "INDEXED",
            };
          }),
        });
        await reportProgress({ stage: "indexing", completed: end, total: chunks.length });
      }
      return { chunks: chunks.length, searchBackend: "chroma" };
    } catch (error) {
      if (collection) {
        try {
          await collection.delete({ where: { docId } });
        } catch (cleanupError) {
          console.error(`[medicalKnowledgeBase] Could not remove partial Chroma index for ${docId}:`, cleanupError);
        }
      }
      markChromaFailure(error);
      console.error(`[medicalKnowledgeBase] Chroma indexing failed for ${docId}; MongoDB text index remains available:`, error);
      return { chunks: chunks.length, searchBackend: "mongodb" };
    }
  } catch (error) {
    await KnowledgeBaseChunk.deleteMany({ documentId: doc._id });
    throw error;
  }
}

export async function processApprovedMedicalDocument(docId) {
  const doc = await KnowledgeBaseDoc.findOneAndUpdate(
    { _id: docId, status: "APPROVED", reviewedBy: { $ne: null } },
    {
      $set: {
        status: "PROCESSING",
        processingError: "",
        processingStage: "downloading",
        processingCompleted: 0,
        processingTotal: 0,
        processingPass: 0,
        processingUpdatedAt: new Date(),
        chunks: 0,
        searchBackend: "",
      },
    },
    { new: true }
  );
  if (!doc) return false;

  try {
    let lastStage = "";
    let lastCompleted = 0;
    let lastPass = 0;
    const reportProgress = async ({ stage, completed = 0, total = 0, pass = 0 }) => {
      const stageChanged = stage !== lastStage || pass !== lastPass;
      if (!stageChanged && completed !== total && completed - lastCompleted < 8) return;
      const result = await KnowledgeBaseDoc.updateOne(
        { _id: docId, status: "PROCESSING" },
        {
          $set: {
            processingStage: stage,
            processingCompleted: completed,
            processingTotal: total,
            processingPass: pass,
            processingUpdatedAt: new Date(),
          },
        }
      );
      lastStage = stage;
      lastCompleted = completed;
      lastPass = pass;
      return result;
    };
    const result = await indexMedicalDocument(doc, reportProgress);
    const updated = await KnowledgeBaseDoc.findOneAndUpdate(
      { _id: docId, status: "PROCESSING" },
      {
        $set: {
          status: "INDEXED",
          chunks: result.chunks,
          searchBackend: result.searchBackend,
          indexedAt: new Date(),
          processingError: "",
          processingStage: "",
          processingCompleted: 0,
          processingTotal: 0,
          processingPass: 0,
          processingUpdatedAt: null,
        },
      },
      { new: true }
    );
    if (!updated) {
      await removeMedicalDocumentChunks(docId);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[medicalKnowledgeBase] Indexing failed for ${docId}:`, error);
    await KnowledgeBaseDoc.findOneAndUpdate(
      { _id: docId, status: "PROCESSING" },
      {
        $set: {
          status: "FAILED",
          chunks: 0,
          searchBackend: "",
          indexedAt: null,
          processingStage: "",
          processingCompleted: 0,
          processingTotal: 0,
          processingPass: 0,
          processingUpdatedAt: null,
          processingError: String(error.message || "Document indexing failed").slice(0, 1000),
        },
      }
    );
    return false;
  }
}

export function enqueueApprovedMedicalDocument(docId) {
  const job = processingQueue.then(() => processApprovedMedicalDocument(docId));
  processingQueue = job.catch((error) => {
    console.error(`[medicalKnowledgeBase] Queued processing failed for ${docId}:`, error);
  });
  return job;
}

export async function resumeInterruptedMedicalDocuments() {
  const interruptedDocs = await KnowledgeBaseDoc.find({ status: "PROCESSING" }).select("_id").lean();
  for (const { _id } of interruptedDocs) {
    const reset = await KnowledgeBaseDoc.updateOne(
      { _id, status: "PROCESSING" },
      {
        $set: {
          status: "APPROVED",
          processingError: "",
          processingStage: "",
          processingCompleted: 0,
          processingTotal: 0,
          processingPass: 0,
          processingUpdatedAt: null,
        },
      }
    );
    if (reset.modifiedCount > 0) enqueueApprovedMedicalDocument(_id);
  }
  if (interruptedDocs.length) {
    console.warn(`[medicalKnowledgeBase] Resuming ${interruptedDocs.length} interrupted document job(s)`);
  }

  const approvedDocs = await KnowledgeBaseDoc.find({ status: "APPROVED" }).select("_id").lean();
  for (const { _id } of approvedDocs) enqueueApprovedMedicalDocument(_id);
  if (approvedDocs.length) {
    console.info(`[medicalKnowledgeBase] Queued ${approvedDocs.length} approved document job(s)`);
  }
}
