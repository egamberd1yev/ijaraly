import { AppDataSource } from "../config/data-source.js";
import { Region } from "../entities/Region.js";

const regionRepo = () => AppDataSource.getRepository(Region);

export async function getAllRegions(req, res) {
  try {
    const regions = await regionRepo()
      .createQueryBuilder("region")
      .orderBy("region.name", "ASC")
      .getMany();
    return res.json({ regions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}
