import mongoose from "mongoose";
import KnowledgeBaseDoc from "../models/KnowledgeBaseDoc.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { logAction } from "../services/auditService.js";
import { deletePrivatePdf, uploadPrivatePdf } from "../services/cloudinaryService.js";
import { enqueueApprovedMedicalDocument } from "../services/medicalKnowledgeBaseService.js";

const publicFields =
  "title originalFilename sourceOrganization sourceUrl category language version publicationDate description fileSize chunks searchBackend status processingStage processingCompleted processingTotal processingPass processingUpdatedAt uploadedBy reviewedBy reviewedAt rejectionReason processingError indexedAt createdAt updatedAt";

const asPublicDoc = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  const publicValue = { ...value };
  delete publicValue.cloudinaryAssetId;
  delete publicValue.cloudinaryPublicId;
  delete publicValue.cloudinaryResourceType;
  delete publicValue.cloudinaryFormat;
  const publicUser = (user) =>
    user && typeof user === "object" && user.fullName
      ? { _id: user._id, fullName: user.fullName, email: user.email }
      : user?._id || user || null;
  return {
    ...publicValue,
    uploadedBy: publicUser(value.uploadedBy),
    reviewedBy: publicUser(value.reviewedBy),
  };
};

const validUrl = (value) => {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || value.length > 2048) {
    throw new ApiError(400, "Source URL must be 2048 characters or fewer.");
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new ApiError(400, "Source URL must be a valid HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ApiError(400, "Source URL must use HTTP or HTTPS.");
  }
  return parsed.toString();
};

export const listDocs = asyncHandler(async (req, res) => {
  const { search = "", status, category } = req.query;
  const filter = { cloudinaryAssetId: { $exists: true, $ne: "" } };
  if (typeof status === "string" && status !== "ALL") filter.status = status;
  if (typeof category === "string" && category !== "ALL") filter.category = category;
  const searchTerm = typeof search === "string" ? search.trim() : "";
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { title: regex },
      { sourceOrganization: regex },
      { originalFilename: regex },
      { category: regex },
    ];
  }
  const docs = await KnowledgeBaseDoc.find(filter)
    .select(publicFields)
    .populate("uploadedBy", "fullName email")
    .populate("reviewedBy", "fullName email")
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, docs.map(asPublicDoc));
});

export const getDoc = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid document ID.");
  const doc = await KnowledgeBaseDoc.findOne({ _id: req.params.id, cloudinaryAssetId: { $exists: true } })
    .select(publicFields)
    .populate("uploadedBy", "fullName email")
    .populate("reviewedBy", "fullName email")
    .lean();
  if (!doc) throw new ApiError(404, "Knowledge base document not found.");
  return ok(res, asPublicDoc(doc));
});

export const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "A PDF file is required.");
  if (!req.file.buffer.subarray(0, 1024).includes(Buffer.from("%PDF-"))) {
    throw new ApiError(400, "The uploaded file is not a valid PDF.");
  }

  const { title, sourceOrganization, category, language, version, publicationDate, description } = req.body;
  if (
    typeof title !== "string" ||
    typeof sourceOrganization !== "string" ||
    typeof category !== "string" ||
    typeof language !== "string" ||
    !title.trim() ||
    !sourceOrganization.trim() ||
    !category.trim() ||
    !language.trim()
  ) {
    throw new ApiError(400, "Title, source organization, category, and language are required.");
  }
  if (title.length > 200 || sourceOrganization.length > 200 || category.length > 80 || language.length > 60) {
    throw new ApiError(400, "One or more document metadata fields exceed the allowed length.");
  }
  if (version != null && version !== "" && (typeof version !== "string" || version.length > 100)) {
    throw new ApiError(400, "Version must be 100 characters or fewer.");
  }
  if (description != null && description !== "" && (typeof description !== "string" || description.length > 1000)) {
    throw new ApiError(400, "Description must be 1000 characters or fewer.");
  }
  if (req.file.originalname.length > 255) {
    throw new ApiError(400, "The original filename must be 255 characters or fewer.");
  }
  const parsedDate = publicationDate ? new Date(publicationDate) : null;
  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Publication date is invalid.");
  }
  const sourceUrl = validUrl(req.body.sourceUrl);

  const cloudAsset = await uploadPrivatePdf(req.file.buffer, req.file.originalname);
  let doc;
  try {
    doc = await KnowledgeBaseDoc.create({
      title: title.trim(),
      originalFilename: req.file.originalname,
      sourceOrganization: sourceOrganization.trim(),
      sourceUrl,
      category: category.trim(),
      language: language.trim(),
      version: version?.trim() || "",
      publicationDate: parsedDate,
      description: description?.trim() || "",
      cloudinaryAssetId: cloudAsset.assetId,
      cloudinaryPublicId: cloudAsset.publicId,
      cloudinaryResourceType: cloudAsset.resourceType,
      cloudinaryFormat: cloudAsset.format,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      status: "PENDING",
    });
  } catch (error) {
    try {
      await deletePrivatePdf({ publicId: cloudAsset.publicId, resourceType: cloudAsset.resourceType });
    } catch (cleanupError) {
      console.error("[knowledgeBaseController:uploadDoc] Cloudinary cleanup failed:", cleanupError);
    }
    throw error;
  }
  await logAction(req.user, "Uploaded medical knowledge base document", {
    docId: doc._id,
    title: doc.title,
  });
  return created(res, asPublicDoc(doc), "Medical document uploaded and pending review.");
});

export const approveDoc = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid document ID.");
  const doc = await KnowledgeBaseDoc.findOneAndUpdate(
    { _id: req.params.id, status: "PENDING" },
    {
      $set: {
        status: "APPROVED",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        rejectionReason: "",
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
  if (!doc) {
    const exists = await KnowledgeBaseDoc.exists({ _id: req.params.id });
    throw new ApiError(exists ? 409 : 404, exists ? "Only pending documents can be approved." : "Document not found.");
  }
  void enqueueApprovedMedicalDocument(doc._id).catch((error) =>
    console.error(`[knowledgeBaseController:approveDoc] Could not start processing ${doc._id}:`, error)
  );
  await logAction(req.user, "Approved medical knowledge base document", { docId: doc._id });
  return ok(res, asPublicDoc(doc), "Document approved. Indexing has started.");
});

export const rejectDoc = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid document ID.");
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 1000) : "";
  const doc = await KnowledgeBaseDoc.findOneAndUpdate(
    { _id: req.params.id, status: "PENDING" },
    {
      $set: {
        status: "REJECTED",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        rejectionReason: reason,
        processingError: "",
      },
    },
    { new: true }
  );
  if (!doc) {
    const exists = await KnowledgeBaseDoc.exists({ _id: req.params.id });
    throw new ApiError(exists ? 409 : 404, exists ? "Only pending documents can be rejected." : "Document not found.");
  }
  await logAction(req.user, "Rejected medical knowledge base document", { docId: doc._id, reason });
  return ok(res, asPublicDoc(doc), "Document rejected and excluded from retrieval.");
});

export const retryDoc = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid document ID.");
  const doc = await KnowledgeBaseDoc.findOneAndUpdate(
    { _id: req.params.id, status: { $in: ["FAILED", "INDEXED"] } },
    {
      $set: {
        status: "APPROVED",
        processingError: "",
        processingStage: "",
        processingCompleted: 0,
        processingTotal: 0,
        processingPass: 0,
        processingUpdatedAt: null,
        chunks: 0,
        searchBackend: "",
        indexedAt: null,
      },
    },
    { new: true }
  );
  if (!doc) {
    const exists = await KnowledgeBaseDoc.exists({ _id: req.params.id });
    throw new ApiError(exists ? 409 : 404, exists ? "Only failed or indexed documents can be reindexed." : "Document not found.");
  }
  void enqueueApprovedMedicalDocument(doc._id).catch((error) =>
    console.error(`[knowledgeBaseController:retryDoc] Could not restart processing ${doc._id}:`, error)
  );
  return ok(res, asPublicDoc(doc), "Reindex accepted. Indexing has restarted.");
});
