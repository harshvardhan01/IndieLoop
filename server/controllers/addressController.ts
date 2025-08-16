
import type { Request, Response } from "express";
import { z } from "zod";
import { insertAddressSchema } from "@shared/schema";
import { addressService } from "../services/addressService";

export class AddressController {
	static async getAddresses(req: any, res: Response) {
		try {
			const addresses = await addressService.getUserAddresses(req.user.userId);
			res.json(addresses);
		} catch (error) {
			console.error("Error fetching addresses:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	static async createAddress(req: any, res: Response) {
		try {
			const addressData = insertAddressSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const address = await addressService.createAddress(addressData);
			res.json(address);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create address" });
		}
	}

	static async updateAddress(req: any, res: Response) {
		try {
			// First check if the address belongs to the user
			const userAddresses = await addressService.getUserAddresses(req.user.userId);
			const addressExists = userAddresses.find(addr => addr.id === req.params.id);
			
			if (!addressExists) {
				return res.status(404).json({ message: "Address not found" });
			}

			const addressData = insertAddressSchema.parse({
				...req.body,
				userId: req.user.userId
			});
			
			const address = await addressService.updateAddress(req.params.id, addressData);
			if (!address) {
				return res.status(404).json({ message: "Address not found" });
			}
			res.json(address);
		} catch (error) {
			console.error("Error updating address:", error);
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to update address" });
		}
	}

	static async deleteAddress(req: any, res: Response) {
		try {
			// First check if the address belongs to the user
			const userAddresses = await addressService.getUserAddresses(req.user.userId);
			const addressExists = userAddresses.find(addr => addr.id === req.params.id);
			
			if (!addressExists) {
				return res.status(404).json({ message: "Address not found" });
			}

			const success = await addressService.deleteAddress(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Address not found" });
			}
			res.json({ message: "Address deleted successfully" });
		} catch (error) {
			console.error("Error deleting address:", error);
			res.status(500).json({ message: "Failed to delete address" });
		}
	}
}
