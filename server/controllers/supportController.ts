import type { Request, Response } from "express";
import { z } from "zod";
import { insertSupportMessageSchema } from "@shared/schema";
import { supportService } from "../services/supportService";
import { sendEmail } from "../config/email";

export class SupportController {
	static async createSupportMessage(req: Request, res: Response) {
		try {
			const messageData = insertSupportMessageSchema.parse(req.body);
			const message = await supportService.createSupportMessage(messageData);

			// Send email notification
			const emailSent = await sendEmail({
				to: "jasapa7424@cotasen.com",
				subject: `New Support Message from ${messageData.name}`,
				text: `
Name: ${messageData.name}
Email: ${messageData.email}
Phone: ${messageData.phone || "Not provided"}

Message:
${messageData.message}
        `,
			});

			res.json({
				message: "Support message sent successfully",
				emailSent,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to send support message" });
		}
	}

	static async getAllSupportMessages(req: any, res: Response) {
		try {
			const messages = await supportService.getAllSupportMessages();
			res.json(messages);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch support messages" });
		}
	}

	static async updateSupportMessageStatus(req: any, res: Response) {
		try {
			const { status } = req.body;
			const message = await supportService.updateSupportMessageStatus(req.params.id, status);
			if (!message) {
				return res.status(404).json({ message: "Support message not found" });
			}
			res.json(message);
		} catch (error) {
			res.status(500).json({ message: "Failed to update support message status" });
		}
	}
}