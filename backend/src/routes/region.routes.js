import { Router } from "express";
import { getAllRegions } from "../controllers/region.controller.js";

const router = Router();

router.get("/", getAllRegions);

export default router;
