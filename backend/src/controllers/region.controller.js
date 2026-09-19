import { REGIONS } from "../constants/regions.js";

export function getAllRegions(req, res) {
  return res.json({ regions: REGIONS });
}