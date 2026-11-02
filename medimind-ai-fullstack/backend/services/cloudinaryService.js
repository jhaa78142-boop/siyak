import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

const hasCredentials = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

function configureCloudinary() {
  if (!hasCredentials()) {
    throw new Error("Cloudinary is not configured. Set the server-side Cloudinary credentials.");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadStream(options, buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error("Cloudinary returned no upload result"));
      resolve(result);
    });
    Readable.from([buffer]).pipe(stream);
  });
}

export async function uploadPrivatePdf(buffer, filename) {
  configureCloudinary();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.pdf$/i, "");
  const result = await uploadStream(
    {
      folder: process.env.CLOUDINARY_MEDICAL_KB_FOLDER || "medimind/medical-knowledge-base",
      public_id: `${randomUUID()}-${safeName}.pdf`,
      resource_type: "raw",
      type: "authenticated",
      overwrite: false,
    },
    buffer
  );

  return {
    assetId: result.asset_id,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format || "pdf",
  };
}

export async function downloadPrivatePdf({ publicId, format = "pdf", resourceType = "raw" }) {
  configureCloudinary();
  const url = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download the private Cloudinary PDF (HTTP ${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function deletePrivatePdf({ publicId, resourceType = "raw" }) {
  configureCloudinary();
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    invalidate: true,
  });
}
