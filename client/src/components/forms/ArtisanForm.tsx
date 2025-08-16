
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Artisan } from "@shared/schema";

interface ArtisanFormData {
	name: string;
	location: string;
	specialization: string;
	experience: string;
	bio: string;
	story: string;
	image: string;
}

interface ArtisanFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingArtisan: Artisan | null;
	onSuccess?: () => void;
}

export default function ArtisanForm({
	isOpen,
	onOpenChange,
	editingArtisan,
	onSuccess,
}: ArtisanFormProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [artisanForm, setArtisanForm] = useState<ArtisanFormData>({
		name: editingArtisan?.name || "",
		location: editingArtisan?.location || "",
		specialization: editingArtisan?.specialization || "",
		experience: editingArtisan?.experience || "",
		bio: editingArtisan?.bio || "",
		story: editingArtisan?.story || "",
		image: editingArtisan?.image || "",
	});

	// Update form when editingArtisan changes
	useEffect(() => {
		setArtisanForm({
			name: editingArtisan?.name || "",
			location: editingArtisan?.location || "",
			specialization: editingArtisan?.specialization || "",
			experience: editingArtisan?.experience || "",
			bio: editingArtisan?.bio || "",
			story: editingArtisan?.story || "",
			image: editingArtisan?.image || "",
		});
	}, [editingArtisan]);

	const createArtisanMutation = useMutation({
		mutationFn: async (artisanData: ArtisanFormData) => {
			const sessionId = localStorage.getItem("sessionId");
			const response = await fetch("/api/artisans", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionId}`,
				},
				body: JSON.stringify(artisanData),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create artisan");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			onOpenChange(false);
			resetForm();
			onSuccess?.();
			toast({
				title: "Success",
				description: "Artisan created successfully",
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateArtisanMutation = useMutation({
		mutationFn: async ({
			id,
			...artisanData
		}: ArtisanFormData & { id: string }) => {
			const sessionId = localStorage.getItem("sessionId");
			const response = await fetch(`/api/artisans/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionId}`,
				},
				body: JSON.stringify(artisanData),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update artisan");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			onOpenChange(false);
			resetForm();
			onSuccess?.();
			toast({
				title: "Success",
				description: "Artisan updated successfully",
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setArtisanForm({
			name: "",
			location: "",
			specialization: "",
			experience: "",
			bio: "",
			story: "",
			image: "",
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation with proper null checks
		if (!artisanForm.name || !artisanForm.name.trim()) {
			toast({
				title: "Error",
				description: "Name is required",
				variant: "destructive",
			});
			return;
		}

		if (!artisanForm.location || !artisanForm.location.trim()) {
			toast({
				title: "Error",
				description: "Location is required",
				variant: "destructive",
			});
			return;
		}

		if (!artisanForm.specialization || !artisanForm.specialization.trim()) {
			toast({
				title: "Error",
				description: "Specialization is required",
				variant: "destructive",
			});
			return;
		}

		if (editingArtisan) {
			updateArtisanMutation.mutate({
				id: editingArtisan.id,
				...artisanForm,
			});
		} else {
			createArtisanMutation.mutate(artisanForm);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onOpenChange}>
			<ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<ModalHeader>
					<ModalTitle>
						{editingArtisan ? "Edit Artisan" : "Add New Artisan"}
					</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={artisanForm.name}
								onChange={(e) =>
									setArtisanForm({
										...artisanForm,
										name: e.target.value,
									})
								}
								placeholder="Artisan name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="location">Location *</Label>
							<Input
								id="location"
								value={artisanForm.location}
								onChange={(e) =>
									setArtisanForm({
										...artisanForm,
										location: e.target.value,
									})
								}
								placeholder="City, Country"
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="specialization">
								Specialization *
							</Label>
							<Input
								id="specialization"
								value={artisanForm.specialization}
								onChange={(e) =>
									setArtisanForm({
										...artisanForm,
										specialization: e.target.value,
									})
								}
								placeholder="e.g., Pottery, Weaving"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="experience">Experience</Label>
							<Input
								id="experience"
								value={artisanForm.experience}
								onChange={(e) =>
									setArtisanForm({
										...artisanForm,
										experience: e.target.value,
									})
								}
								placeholder="e.g., 15 years"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="image">Image URL</Label>
						<Input
							id="image"
							value={artisanForm.image}
							onChange={(e) =>
								setArtisanForm({
									...artisanForm,
									image: e.target.value,
								})
							}
							placeholder="https://example.com/image.jpg"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							value={artisanForm.bio}
							onChange={(e) =>
								setArtisanForm({
									...artisanForm,
									bio: e.target.value,
								})
							}
							placeholder="Short biography"
							className="min-h-20"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="story">Story</Label>
						<Textarea
							id="story"
							value={artisanForm.story}
							onChange={(e) =>
								setArtisanForm({
									...artisanForm,
									story: e.target.value,
								})
							}
							placeholder="Artisan's detailed story"
							className="min-h-32"
						/>
					</div>
					<div className="flex space-x-2">
						<Button
							type="submit"
							className="flex-1"
							disabled={
								createArtisanMutation.isPending ||
								updateArtisanMutation.isPending
							}>
							{editingArtisan
								? "Update Artisan"
								: "Create Artisan"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								resetForm();
							}}>
							Cancel
						</Button>
					</div>
				</form>
			</ModalContent>
		</Modal>
	);
}
