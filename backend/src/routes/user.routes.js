import { Router } from "express";
import {
  searchUsers,
  getPublicProfile,
  createReport,
  createComment,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  userSearchQuerySchema,
  createReportSchema,
  createCommentSchema,
} from "../validation/schemas.js";

const router = Router();

router.get("/users/search", requireAuth, validate(userSearchQuerySchema, "query"), searchUsers);
router.get("/users/:id/profile", requireAuth, getPublicProfile);
router.post("/users/:id/report", requireAuth, validate(createReportSchema), createReport);
router.post("/users/:id/comments", requireAuth, validate(createCommentSchema), createComment);

export default router;