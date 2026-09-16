import { Router } from "express";
import { getAllRegions } from "../controllers/region.controller.js";

const router = Router();

// Barcha viloyatlar ro'yxati — public, login shart emas
router.get("/", getAllRegions);

export default router;
