import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { createWorker, PSM, OEM } from "tesseract.js";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const DICOM_EXTENSIONS = new Set([".dicom", ".dcm"]);
const PAGE_BREAK = "\n\n--- PAGE BREAK ---\n\n";

/**
 * Minimum confidence (0-100) for Tesseract OCR output.
 * Below this we retry with enhanced preprocessing.
 */
const MIN_CONFIDENCE = 55;

/**
 * PDF render scale — higher = more detail for small text in medical reports.
 * 3x gives ~216 DPI from a 72-DPI PDF, which is the sweet spot for Tesseract.
 */
const PDF_RENDER_SCALE = 3;

/**
 * Minimum text-layer length to trust a PDF's embedded text
 * and skip OCR entirely.
 */
const MIN_TEXT_LAYER_LEN = 30;

// ---------------------------------------------------------------------------
// Image preprocessing with Sharp
// ---------------------------------------------------------------------------

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[ocrService] sharp is not installed — image preprocessing will be skipped. Install with: npm i sharp");
  sharp = null;
}

/**
 * Preprocess an image buffer for Tesseract OCR.
 * Returns a PNG buffer optimized for text recognition.
 *
 * Level 1 (standard):  grayscale + normalize + sharpen + upscale to ≥300 DPI
 * Level 2 (enhanced):  adds threshold (binarization) for very noisy images
 */
async function preprocessImage(buffer, { level = 1, targetDpi = 300 } = {}) {
  if (!sharp) return buffer;

  try {
    let pipeline = sharp(buffer, { failOnError: false });

    // Get metadata to decide if upscaling is needed
    const meta = await pipeline.metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;

    // Medical documents are typically letter/A4 size.
    // At 300 DPI, letter width = 2550px. If the image is smaller, upscale.
    const minWidth = targetDpi * 8; // ~8 inches
    const scaleFactor = width < minWidth ? Math.min(minWidth / Math.max(width, 1), 4) : 1;

    // Step 1: Convert to grayscale
    pipeline = pipeline.grayscale();

    // Step 2: Upscale if needed (bicubic interpolation for quality)
    if (scaleFactor > 1.1) {
      pipeline = pipeline.resize({
        width: Math.round(width * scaleFactor),
        height: Math.round(height * scaleFactor),
        fit: "fill",
        kernel: "lanczos3",
      });
    }

    // Step 3: Normalize contrast (stretches the histogram)
    pipeline = pipeline.normalize();

    // Step 4: Sharpen to improve edge definition of text
    pipeline = pipeline.sharpen({
      sigma: 1.5,
      m1: 1.0,   // flat areas
      m2: 2.0,   // jagged areas (text edges)
    });

    // Step 5 (Level 2 only): Binarize for very noisy / low contrast documents
    if (level >= 2) {
      pipeline = pipeline.threshold(140);
    }

    // Output as lossless PNG for Tesseract
    return await pipeline.png({ compressionLevel: 1 }).toBuffer();
  } catch (err) {
    console.warn("[ocrService] Image preprocessing failed, using raw image:", err.message);
    return buffer;
  }
}

// ---------------------------------------------------------------------------
// PDF text extraction
// ---------------------------------------------------------------------------

function isPdf(filePath, mimeType = "") {
  return PDF_EXTENSIONS.has(path.extname(filePath).toLowerCase()) || mimeType === "application/pdf";
}

async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return typeof result?.text === "string" ? result.text.trim() : "";
  } finally {
    await parser.destroy?.();
  }
}

// ---------------------------------------------------------------------------
// Tesseract OCR with preprocessing & confidence-based retry
// ---------------------------------------------------------------------------

/**
 * Recognize text from a list of image buffers.
 * Uses Sharp preprocessing and Tesseract with medical-document-optimized settings.
 *
 * @param {Buffer[]} images - Array of image buffers
 * @param {object} opts
 * @param {number} opts.preprocessLevel - 1 (standard) or 2 (enhanced/binarized)
 * @returns {{ text: string, pageTexts: string[], confidences: number[], avgConfidence: number }}
 */
async function recognizeImages(images, { preprocessLevel = 1, onProgress, pass = 1 } = {}) {
  const worker = await createWorker("eng", OEM.LSTM_ONLY);
  try {
    // Tesseract parameters tuned for medical documents:
    //   PSM 6 = "Assume a single uniform block of text" — works best for documents
    //   preserve_interword_spaces = keep column spacing in lab tables
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
      tessedit_char_whitelist: "",  // allow all characters
    });

    const pages = [];
    const confidences = [];
    let totalConfidence = 0;
    let pageCount = 0;

    for (const [index, image] of images.entries()) {
      // Preprocess each image for OCR accuracy
      const processed = await preprocessImage(image, { level: preprocessLevel });
      const result = await worker.recognize(processed);

      const pageText = result?.data?.text?.trim() || "";
      const confidence = result?.data?.confidence ?? 0;

      pages.push(pageText);
      confidences.push(confidence);

      totalConfidence += confidence;
      pageCount++;
      await onProgress?.({ completed: index + 1, total: images.length, pass });
    }

    const text = pages.filter(Boolean).join(PAGE_BREAK).trim();
    const avgConfidence = pageCount > 0 ? totalConfidence / pageCount : 0;

    return { text, pageTexts: pages, confidences, avgConfidence };
  } finally {
    await worker.terminate();
  }
}

// ---------------------------------------------------------------------------
// Post-processing: clean up common OCR artifacts
// ---------------------------------------------------------------------------

/**
 * Clean OCR output to fix common recognition mistakes in medical documents.
 */
function cleanOcrText(text) {
  if (!text) return "";

  let cleaned = text;

  // 1. Fix common OCR character substitutions
  //    - '|' misread as 'l' or 'I' at start of lines (table borders)
  //    - Stray pipe characters that aren't part of actual content
  cleaned = cleaned.replace(/^\|+\s*/gm, "");
  cleaned = cleaned.replace(/\s*\|+$/gm, "");

  // 2. Collapse excessive whitespace but keep intentional column spacing
  //    Replace runs of 4+ spaces with a tab (table column separator)
  cleaned = cleaned.replace(/ {4,}/g, "\t");

  // 3. Remove non-printable / garbage characters (but keep medical symbols like µ, ±, °)
  cleaned = cleaned.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u024F\u2000-\u206F\t\n\r]/g, "");

  // 4. Fix common OCR misreads in medical values
  //    'O' vs '0' — in numeric contexts, 'O' is almost always '0'
  cleaned = cleaned.replace(/(\d)O(\d)/g, "$10$2");
  cleaned = cleaned.replace(/O(\.\d)/g, "0$1");

  //    'l' vs '1' — in numeric contexts after a dot, 'l' is almost always '1'
  cleaned = cleaned.replace(/(\d\.)l/g, "$11");

  //    'S' vs '5' — common in lab values
  cleaned = cleaned.replace(/(\d)S(\d)/g, "$15$2");

  // 5. Fix common unit misreads
  cleaned = cleaned.replace(/mg\/d[lI]/gi, "mg/dL");
  cleaned = cleaned.replace(/g\/d[lI]/gi, "g/dL");
  cleaned = cleaned.replace(/m[lI]U\/[lI]/gi, "mIU/L");
  cleaned = cleaned.replace(/µ[lI]U\/m[lI]/gi, "µIU/mL");
  cleaned = cleaned.replace(/mmol\/[lI]/gi, "mmol/L");
  cleaned = cleaned.replace(/µmol\/[lI]/gi, "µmol/L");
  cleaned = cleaned.replace(/mEq\/[lI]/gi, "mEq/L");
  cleaned = cleaned.replace(/ce[li]{2}s\/[µu][lI]/gi, "cells/µL");

  // 6. Collapse blank lines (keep max 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 7. Trim each line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  return cleaned;
}

// ---------------------------------------------------------------------------
// Main extraction entry-point
// ---------------------------------------------------------------------------

/**
 * Extract text from a file using the best available method:
 *   1. PDF text-layer extraction (for digital PDFs)
 *   2. PDF → image → OCR pipeline (for scanned PDFs)
 *   3. Direct image OCR (for JPG/PNG/etc.)
 *
 * Returns { text, source, confidence? , error? }
 */
export async function extractText(filePath, mimeType = "", { onProgress, pageNumbers } = {}) {
  try {
    const extension = path.extname(filePath).toLowerCase();

    if (DICOM_EXTENSIONS.has(extension)) {
      return { text: "", error: "DICOM OCR is not supported; use the imaging analysis path." };
    }

    const fileBuffer = await fs.readFile(filePath);

    // ── PDF path ──────────────────────────────────────────────────────
    if (isPdf(filePath, mimeType)) {
      // Try extracting embedded text layer first
      let textLayerContent = "";
      try {
        textLayerContent = await extractPdfText(fileBuffer);
      } catch (err) {
        console.warn("[ocrService] PDF text-layer extraction failed:", err.message);
      }

      // If the text layer has meaningful content, use it (much more accurate than OCR)
      if (textLayerContent.length >= MIN_TEXT_LAYER_LEN) {
        return {
          text: cleanOcrText(textLayerContent),
          source: "pdf-text-layer",
          confidence: 99,
        };
      }

      // Fall back to OCR: render PDF pages to images, then recognize
      let pdf2img;
      try {
        pdf2img = await import("pdf-img-convert");
      } catch {
        return {
          text: textLayerContent || "",
          source: "pdf-text-layer",
          error: textLayerContent ? undefined : "pdf-img-convert is not installed for scanned-PDF OCR.",
        };
      }

      const requestedPageNumbers = Array.isArray(pageNumbers) && pageNumbers.length
        ? [...new Set(pageNumbers.filter((page) => Number.isInteger(page) && page > 0))]
        : [];
      const selectedPageNumbers = requestedPageNumbers.length ? requestedPageNumbers : undefined;
      const renderedPages = await pdf2img.convert(fileBuffer, {
        scale: PDF_RENDER_SCALE,
        ...(selectedPageNumbers ? { page_numbers: selectedPageNumbers } : {}),
      });
      const pageImages = Array.from(renderedPages || []);

      if (pageImages.length === 0) {
        return {
          text: textLayerContent || "",
          source: "pdf-text-layer",
          error: textLayerContent ? undefined : "No pages could be rendered from this PDF.",
        };
      }

      const firstPass = await recognizeImages(pageImages, { preprocessLevel: 1, onProgress, pass: 1 });
      const pageTexts = [...firstPass.pageTexts];
      let totalConfidence = firstPass.confidences.reduce((sum, confidence) => sum + confidence, 0);

      const lowConfidenceIndexes = firstPass.confidences
        .map((confidence, index) => confidence < MIN_CONFIDENCE ? index : -1)
        .filter((index) => index >= 0);
      if (lowConfidenceIndexes.length) {
        console.info(`[ocrService] Retrying ${lowConfidenceIndexes.length} low-confidence PDF page(s) with enhanced preprocessing`);
        const retry = await recognizeImages(
          lowConfidenceIndexes.map((index) => pageImages[index]),
          { preprocessLevel: 2, onProgress, pass: 2 }
        );
        lowConfidenceIndexes.forEach((pageIndex, retryIndex) => {
          if (retry.confidences[retryIndex] > firstPass.confidences[pageIndex]) {
            totalConfidence += retry.confidences[retryIndex] - firstPass.confidences[pageIndex];
            pageTexts[pageIndex] = retry.pageTexts[retryIndex];
          }
        });
      }

      const text = pageTexts.filter(Boolean).join(PAGE_BREAK).trim();
      const avgConfidence = firstPass.confidences.length
        ? totalConfidence / firstPass.confidences.length
        : 0;
      const confidence = Math.round(avgConfidence);
      if (selectedPageNumbers) {
        return {
          text: cleanOcrText(text),
          pageTexts: pageTexts.map(cleanOcrText),
          pageNumbers: selectedPageNumbers,
          source: "pdf-ocr",
          confidence,
        };
      }

      // If a PDF has a partial text layer, prefer it when OCR returns less content.
      if (textLayerContent && (!text || text.length < textLayerContent.length)) {
        return {
          text: cleanOcrText(textLayerContent),
          source: "pdf-text-layer",
          confidence: 99,
        };
      }

      return {
        text: cleanOcrText(text),
        pageTexts: pageTexts.map(cleanOcrText),
        source: "pdf-ocr",
        confidence,
      };
    }

    // ── Image path ────────────────────────────────────────────────────
    if (IMAGE_EXTENSIONS.has(extension) || mimeType.startsWith("image/")) {
      // First pass: standard preprocessing
      let { text, avgConfidence } = await recognizeImages([fileBuffer], { preprocessLevel: 1 });

      // If confidence is low, retry with enhanced preprocessing
      if (avgConfidence < MIN_CONFIDENCE) {
        console.info(`[ocrService] Low image confidence (${avgConfidence.toFixed(1)}%), retrying with enhanced preprocessing…`);
        const retry = await recognizeImages([fileBuffer], { preprocessLevel: 2 });
        if (retry.avgConfidence > avgConfidence) {
          text = retry.text;
          avgConfidence = retry.avgConfidence;
        }
      }

      return {
        text: cleanOcrText(text),
        source: "image-ocr",
        confidence: Math.round(avgConfidence),
      };
    }

    return { text: "", error: `OCR is not supported for file type ${extension || mimeType || "unknown"}` };
  } catch (error) {
    console.error("[ocrService] extractText failed:", error);
    return { text: "", error: error.message || "OCR failed" };
  }
}

export default { extractText };
