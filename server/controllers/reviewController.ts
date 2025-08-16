
import type { Request, Response } from "express";
import { z } from "zod";
import { insertReviewSchema } from "@shared/schema";
import { reviewService } from "../services/reviewService";

export class ReviewController {
	static async getProductReviews(req: Request, res: Response) {
		try {
			const reviews = await reviewService.getProductReviews(req.params.id);
			res.json(reviews);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch reviews" });
		}
	}

	static async createReview(req: any, res: Response) {
		try {
			const { rating, comment } = req.body;

			if (!rating || rating < 1 || rating > 5) {
				return res.status(400).json({ message: "Rating must be between 1 and 5" });
			}

			const reviewData = insertReviewSchema.parse({
				productId: req.params.id,
				userId: req.user.userId,
				rating: parseInt(rating),
				comment: comment?.trim() || null,
			});

			// Check if user already reviewed this product
			const existingReviews = await reviewService.getProductReviews(req.params.id);
			const userHasReviewed = existingReviews.some(
				(review) => review.userId === req.user.userId
			);

			if (userHasReviewed) {
				return res.status(400).json({
					message: "You have already reviewed this product",
				});
			}

			const review = await reviewService.createReview(reviewData);
			res.status(201).json(review);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create review" });
		}
	}
}
