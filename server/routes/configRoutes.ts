
import { Router } from "express";

const router = Router();

router.get("/countries", async (req, res) => {
	try {
		const { COUNTRIES } = await import("../config/constants");
		res.json(COUNTRIES);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch countries" });
	}
});

router.get("/materials", async (req, res) => {
	try {
		const { MATERIALS } = await import("../config/constants");
		res.json(MATERIALS);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch materials" });
	}
});

router.get("/categories", async (req, res) => {
	try {
		const { CATEGORIES } = await import("../config/constants");
		res.json(CATEGORIES);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch categories" });
	}
});

router.get("/currency-rates", async (req, res) => {
	try {
		// Mock exchange rates - in production, fetch from a real API
		const rates = {
			INR: 1,
			USD: 0.012,
			EUR: 0.011,
			AED: 0.044,
		};
		res.json(rates);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch currency rates" });
	}
});

export default router;
