import test from "node:test";
import assert from "node:assert/strict";
import { selectPagesNeedingOcr } from "../services/medicalKnowledgeBaseService.js";

test("selects only PDF pages without a usable text layer for OCR", () => {
  const pages = [
    { num: 1, text: "A sufficiently long page of digitally selectable PDF text." },
    { num: 2, text: "" },
    { num: 3, text: "Short" },
    { num: 4, text: "Another page with a complete text layer." },
  ];

  assert.deepEqual(selectPagesNeedingOcr(pages), [2, 3]);
});

test("uses the page position when a PDF parser omits a page number", () => {
  const pages = [
    { num: 1, text: "A sufficiently long page of digitally selectable PDF text." },
    { text: "" },
  ];

  assert.deepEqual(selectPagesNeedingOcr(pages), [2]);
});
