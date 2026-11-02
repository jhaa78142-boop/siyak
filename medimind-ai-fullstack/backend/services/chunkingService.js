import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 125;

const defaultSeparators = [
  "\n\n",
  "\n",
  ". ",
  "! ",
  "? ",
  "; ",
  " ",
  "",
];

export function createTextSplitter(options = {}) {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError("chunkSize must be a positive integer.");
  }
  if (!Number.isInteger(chunkOverlap) || chunkOverlap < 0 || chunkOverlap >= chunkSize) {
    throw new RangeError("chunkOverlap must be a non-negative integer smaller than chunkSize.");
  }

  return new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: options.separators ?? defaultSeparators,
    lengthFunction: (text) => text.length,
  });
}

export async function splitText(text, options) {
  if (!text || typeof text !== "string") return [];
  const cleaned = text.replace(/\u0000/g, "").trim();
  if (!cleaned) return [];
  const splitter = createTextSplitter(options);
  const chunks = await splitter.splitText(cleaned);
  return chunks.filter((c) => c && c.trim().length > 0);
}

export async function splitTextWithIndex(text, options) {
  const chunks = await splitText(text, options);
  return chunks.map((pageContent, idx) => ({
    pageContent,
    metadata: { chunkIndex: idx, totalChunks: chunks.length },
  }));
}

export const CHUNK_DEFAULTS = {
  chunkSize: DEFAULT_CHUNK_SIZE,
  chunkOverlap: DEFAULT_CHUNK_OVERLAP,
};

export default { splitText, splitTextWithIndex, createTextSplitter, CHUNK_DEFAULTS };
