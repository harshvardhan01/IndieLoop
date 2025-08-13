import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AddReviewFormProps {
	productId: string;
	onReviewAdded?: () => void;
}

export default function AddReviewForm({
	productId,
	onReviewAdded,
}: AddReviewFormProps) {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const submitReviewMutation = useMutation({
		mutationFn: async (reviewData: { rating: number; comment: string }) => {
			const sessionId = localStorage.getItem("sessionId");
			const response = await fetch(`/api/products/${productId}/reviews`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionId}`,
				},
				body: JSON.stringify(reviewData),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to submit review");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["/api/products", productId, "reviews"],
			});
			setRating(0);
			setComment("");
			toast({
				title: "Success",
				description: "Your review has been submitted successfully",
			});
			onReviewAdded?.();
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			toast({
				title: "Error",
				description: "You must be logged in to submit a review",
				variant: "destructive",
			});
			return;
		}

		if (rating === 0) {
			toast({
				title: "Error",
				description: "Please select a rating",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		submitReviewMutation.mutate({ rating, comment: comment.trim() });
	};

	if (!user) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Write a Review</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Rating *</Label>
						<div className="flex items-center space-x-1">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									className="focus:outline-none"
									onMouseEnter={() => setHoverRating(star)}
									onMouseLeave={() => setHoverRating(0)}
									onClick={() => setRating(star)}>
									<Star
										className={`h-6 w-6 ${
											star <= (hoverRating || rating)
												? "text-yellow-400 fill-current"
												: "text-gray-300"
										} transition-colors cursor-pointer`}
									/>
								</button>
							))}
							<span className="ml-2 text-sm text-gray-600">
								{rating > 0 &&
									`${rating} star${rating !== 1 ? "s" : ""}`}
							</span>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="comment">Review (Optional)</Label>
						<Textarea
							id="comment"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Share your thoughts about this product..."
							className="min-h-20"
							maxLength={500}
						/>
						<div className="text-xs text-gray-500 text-right">
							{comment.length}/500 characters
						</div>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting || rating === 0}
						className="w-full">
						{isSubmitting ? "Submitting..." : "Submit Review"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
