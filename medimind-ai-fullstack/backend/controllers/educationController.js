import EducationArticle from "../models/EducationArticle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";

export const listArticles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.tag) filter.tag = req.query.tag;
  if (req.query.audience) filter.audience = { $in: [req.query.audience, "both"] };

  const articles = await EducationArticle.find(filter).sort({ publishedAt: -1 });
  return ok(res, articles);
});

export const createArticle = asyncHandler(async (req, res) => {
  const article = await EducationArticle.create(req.body);
  return created(res, article);
});
