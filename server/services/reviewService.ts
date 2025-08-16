
import {
	type Review,
	type InsertReview,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { storage as userStorage } from "./userService";

export interface IReviewStorage {
	getProductReviews(productId: string): Promise<Review[]>;
	createReview(review: InsertReview): Promise<Review>;
}

export class ReviewStorage implements IReviewStorage {
	private reviews: Map<string, Review> = new Map();

	async getProductReviews(productId: string): Promise<Review[]> {
		const reviews = Array.from(this.reviews.values()).filter(
			(review) => review.productId === productId
		);

		// Enhance reviews with user information
		const reviewsWithUsers = await Promise.all(
			reviews.map(async (review) => {
				try {
					const user = await userStorage.getUser(review.userId);
					return {
						...review,
						userName: user
							? `${user.firstName} ${user.lastName}`
							: "Anonymous User",
					};
				} catch {
					return {
						...review,
						userName: "Anonymous User",
					};
				}
			})
		);

		return reviewsWithUsers;
	}

	async createReview(insertReview: InsertReview): Promise<Review> {
		const id = randomUUID();
		const review: Review = {
			...insertReview,
			id,
			comment: insertReview.comment || null,
			createdAt: new Date(),
		};
		this.reviews.set(id, review);
		return review;
	}
}

export const reviewService = new ReviewStorage();
