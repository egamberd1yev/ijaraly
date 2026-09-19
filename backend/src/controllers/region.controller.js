import { REGIONS } from "../constants/regions.js";

export function getRegions(req, res) {
  return res.json({ regions: REGIONS });
}