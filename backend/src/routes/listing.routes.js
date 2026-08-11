const { Router } = require("express");
const {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
} = require("../controllers/listing.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} = require("../validation/schemas");

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

module.exports = router;
