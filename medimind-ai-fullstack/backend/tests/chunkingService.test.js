import test from "node:test";
import assert from "node:assert/strict";
import { splitText, CHUNK_DEFAULTS, createTextSplitter } from "../services/chunkingService.js";

test("uses a smaller default chunk size to produce more retrieval chunks", () => {
  assert.deepEqual(CHUNK_DEFAULTS, { chunkSize: 500, chunkOverlap: 125 });
});

test("keeps sentence and paragraph boundaries where possible", async () => {
  const text = [
    "Hypertension is persistently elevated blood pressure. Treatment may include lifestyle changes.",
    "Monitor blood pressure regularly and review treatment with a clinician.",
  ].join("\n\n");

  assert.deepEqual(await splitText(text), [text]);
});

test("keeps complete medical statements available within long-document chunks", async () => {
  const statements = Array.from(
    { length: 16 },
    (_, index) =>
      `Section ${index}: The recommended dose is adjusted according to renal function, age, and current medications.`
  );
  const chunks = await splitText(statements.join(" "));

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= CHUNK_DEFAULTS.chunkSize));
  assert.ok(statements.every((statement) => chunks.some((chunk) => chunk.includes(statement))));
});

test("chunks long text within the configured maximum and carries context across boundaries", async () => {
  const text = Array.from({ length: 100 }, (_, index) => `finding-${index}`).join(" ");
  const chunks = await splitText(text, { chunkSize: 250, chunkOverlap: 40, separators: [" "] });

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 250));
  assert.ok(chunks.slice(1).some((chunk, index) => chunks[index].includes(chunk.slice(0, 25))));
  assert.ok(chunks.every((chunk) => !chunk.startsWith(" ") && !chunk.endsWith(" ")));
});

test("cleans null bytes and returns no chunks for empty input", async () => {
  assert.deepEqual(await splitText(" \n\u0000\t "), []);
  assert.deepEqual(await splitText("Blood pressure\u0000 is elevated."), ["Blood pressure is elevated."]);
});

test("rejects invalid chunk sizes and overlap instead of silently defaulting", () => {
  assert.throws(() => createTextSplitter({ chunkSize: 0 }), /chunkSize must be a positive integer/);
  assert.throws(() => createTextSplitter({ chunkSize: 100, chunkOverlap: 100 }), /chunkOverlap must be/);
});
