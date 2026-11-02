import "dotenv/config";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { classifyImage } from "../services/cvService.js";

const samplePath = process.argv[2];
const temporaryPath = path.join(os.tmpdir(), `medimind-imaging-smoke-${Date.now()}.png`);
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

async function main() {
  const filePath = samplePath || temporaryPath;
  if (!samplePath) {
    await fs.writeFile(temporaryPath, onePixelPng);
    console.warn("No sample image path supplied; using a tiny PNG to verify graceful CV status handling.");
  }

  const result = await classifyImage(filePath, "xray");
  console.log(JSON.stringify({ status: result.status, label: result.label, modelId: result.modelId || null }));
  if (!result.status || result.status === "pending") {
    throw new Error("Imaging smoke test left the result pending");
  }

  if (!samplePath) await fs.rm(temporaryPath, { force: true });
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exit(1);
});
