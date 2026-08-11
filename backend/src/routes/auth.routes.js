const { Router } = require("express");
const { signup, login, getMe, updateProfile } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validation/schemas");

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, validate(updateProfileSchema), updateProfile);

module.exports = router;
