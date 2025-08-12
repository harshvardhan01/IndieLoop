import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Artisan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Filter, Search } from "lucide-react";
import { Plus, Edit, Trash2, User, MapPin } from "lucide-react";

export default function AdminArtisans() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isArtisanDialogOpen, setIsArtisanDialogOpen] = useState(false);
	const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [artisanForm, setArtisanForm] = useState({
		name: "",
		bio: "",
		location: "",
		specialization: "",
		experience: "",
		story: "",
		image: "",
	});

	// Fetch artisans
	const { data: artisans = [] } = useQuery<Artisan[]>({
		queryKey: ["admin", "artisans"],
		queryFn: async () => {
			const response = await fetch("/api/artisans", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch artisans");
			return response.json();
		},
	});

	// Create artisan mutation
	const createArtisanMutation = useMutation({
		mutationFn: async (artisanData: typeof artisanForm) => {
			const response = await fetch("/api/artisans", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify(artisanData),
			});
			if (!response.ok) throw new Error("Failed to create artisan");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			setIsArtisanDialogOpen(false);
			resetForm();
			toast({
				title: "Success",
				description: "Artisan created successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to create artisan",
				variant: "destructive",
			});
		},
	});

	// Update artisan mutation
	const updateArtisanMutation = useMutation({
		mutationFn: async ({
			id,
			...artisanData
		}: { id: string } & typeof artisanForm) => {
			const response = await fetch(`/api/artisans/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify(artisanData),
			});
			if (!response.ok) throw new Error("Failed to update artisan");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			setIsArtisanDialogOpen(false);
			setEditingArtisan(null);
			resetForm();
			toast({
				title: "Success",
				description: "Artisan updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update artisan",
				variant: "destructive",
			});
		},
	});

	// Delete artisan mutation
	const deleteArtisanMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/artisans/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to delete artisan");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			toast({
				title: "Success",
				description: "Artisan deleted successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to delete artisan",
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setArtisanForm({
			name: "",
			bio: "",
			location: "",
			specialization: "",
			experience: "",
			story: "",
			image: "",
		});
	};

	const openEditArtisan = (artisan: Artisan) => {
		setEditingArtisan(artisan);
		setArtisanForm({
			name: artisan.name,
			bio: artisan.bio,
			location: artisan.location,
			specialization: artisan.specialization,
			experience: artisan.experience,
			story: artisan.story,
			image: artisan.image || "",
		});
		setIsArtisanDialogOpen(true);
	};

	const handleSubmit = () => {
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
		<div className="space-y-6">
			<div className="container mx-auto p-6">
				<div className="flex items-center gap-2 mb-8">
					<h1 className="text-3xl font-bold">Artisan Management</h1>
				</div>
				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="flex items-center gap-2 flex-1">
						<Search className="h-4 w-4 text-gray-500" />
						<Input
							placeholder="Search by name, or address..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-500" />
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Artisans
								</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">
									Inactive
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Modal
					open={isArtisanDialogOpen}
					onOpenChange={setIsArtisanDialogOpen}>
					<ModalTrigger asChild>
						<Button
							onClick={() => {
								setEditingArtisan(null);
								resetForm();
							}}
							className="bg-craft-brown hover:bg-craft-brown/90">
							<Plus className="w-4 h-4 mr-2" />
							Add Artisan
						</Button>
					</ModalTrigger>
					<ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<ModalHeader>
							<ModalTitle>
								{editingArtisan
									? "Edit Artisan"
									: "Add New Artisan"}
							</ModalTitle>
						</ModalHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={artisanForm.name}
										onChange={(e) =>
											setArtisanForm({
												...artisanForm,
												name: e.target.value,
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="location">Location</Label>
									<Input
										id="location"
										value={artisanForm.location}
										onChange={(e) =>
											setArtisanForm({
												...artisanForm,
												location: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="specialization">
										Specialization
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
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="experience">
										Experience
									</Label>
									<Input
										id="experience"
										value={artisanForm.experience}
										onChange={(e) =>
											setArtisanForm({
												...artisanForm,
												experience: e.target.value,
											})
										}
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
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="bio">Bio</Label>
								<div className="space-y-2">
									<div className="flex gap-2 text-xs text-gray-600">
										<span>
											Supports HTML:
											&lt;b&gt;bold&lt;/b&gt;,
											&lt;i&gt;italic&lt;/i&gt;,
											&lt;br&gt;,
											&lt;p&gt;paragraphs&lt;/p&gt;
										</span>
									</div>
									<Textarea
										id="bio"
										value={artisanForm.bio}
										onChange={(e) =>
											setArtisanForm({
												...artisanForm,
												bio: e.target.value,
											})
										}
										rows={4}
										placeholder="Enter bio with HTML formatting..."
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="story">Story</Label>
								<div className="space-y-2">
									<div className="flex gap-2 text-xs text-gray-600">
										<span>
											Supports HTML:
											&lt;b&gt;bold&lt;/b&gt;,
											&lt;i&gt;italic&lt;/i&gt;,
											&lt;br&gt;,
											&lt;p&gt;paragraphs&lt;/p&gt;,
											&lt;ul&gt;&lt;li&gt;lists&lt;/li&gt;&lt;/ul&gt;
										</span>
									</div>
									<Textarea
										id="story"
										value={artisanForm.story}
										onChange={(e) =>
											setArtisanForm({
												...artisanForm,
												story: e.target.value,
											})
										}
										rows={6}
										placeholder="Enter artisan story with HTML formatting..."
									/>
								</div>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setIsArtisanDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleSubmit}>
								{editingArtisan ? "Update" : "Create"} Artisan
							</Button>
						</div>
					</ModalContent>
				</Modal>
			</div>

			<div className="grid gap-6">
				{artisans.map((artisan) => (
					<Card key={artisan.id}>
						<CardHeader>
							<div className="flex items-center space-x-3">
								{artisan.image ? (
									<img
										src={artisan.image}
										alt={artisan.name}
										className="w-12 h-12 rounded-full object-cover"
									/>
								) : (
									<div className="w-12 h-12 rounded-full bg-craft-brown flex items-center justify-center">
										<User className="w-6 h-6 text-white" />
									</div>
								)}
								<div>
									<CardTitle className="text-lg">
										{artisan.name}
									</CardTitle>
									<CardDescription className="flex items-center">
										<MapPin className="w-3 h-3 mr-1" />
										{artisan.location}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 mb-4">
								<p className="text-sm text-gray-600">
									<strong>Specialization:</strong>{" "}
									{artisan.specialization}
								</p>
								<p className="text-sm text-gray-600">
									<strong>Experience:</strong>{" "}
									{artisan.experience}
								</p>
								<p className="text-sm text-gray-600 line-clamp-2">
									{artisan.bio}
								</p>
							</div>
							<div className="flex space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => openEditArtisan(artisan)}>
									<Edit className="w-3 h-3 mr-1" />
									Edit
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() =>
										deleteArtisanMutation.mutate(artisan.id)
									}>
									<Trash2 className="w-3 h-3 mr-1" />
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
