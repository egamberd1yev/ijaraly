import { Router } from "express";
import {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} from "../validation/schemas.js";

const router = Router();

// Bosh sahifa, qidiruv va filter - login shart emas
router.get("/", optionalAuth, validate(listingQuerySchema, "query"), getListings);

// Diqqat: "/mine" route'i "/:id" dan OLDIN turishi kerak,
// aks holda Express "mine"ni id deb tushunib qoladi
router.get("/mine", requireAuth, getMyListings);

router.get("/:id", getListingById);

router.post("/", requireAuth, validate(createListingSchema), createListing);
router.put("/:id", requireAuth, validate(updateListingSchema), updateListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;
