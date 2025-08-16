import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	User,
	MapPin,
	Grid,
	List,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ArtisanForm from "@/components/forms/ArtisanForm";
import type { Artisan } from "@shared/schema";

export default function AdminArtisans() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { toast } = useToast();
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Check if user is admin
	if (!user || !user.isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Access Denied
					</h2>
					<p className="text-gray-600">
						You need admin privileges to access this page.
					</p>
				</div>
			</div>
		);
	}

	const { data: artisans = [], isLoading } = useQuery({
		queryKey: ["admin", "artisans"],
		queryFn: async () => {
			const response = await fetch("/api/artisans");
			if (!response.ok) throw new Error("Failed to fetch artisans");
			return response.json();
		},
	});

	const deleteArtisanMutation = useMutation({
		mutationFn: async (id: string) => {
			const sessionId = localStorage.getItem("sessionId");
			const response = await fetch(`/api/artisans/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${sessionId}`,
				},
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete artisan");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "artisans"] });
			toast({
				title: "Success",
				description: "Artisan deleted successfully",
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

	const handleEdit = (artisan: Artisan) => {
		setEditingArtisan(artisan);
		setIsDialogOpen(true);
	};

	const handleAdd = () => {
		setEditingArtisan(null);
		setIsDialogOpen(true);
	};

	const handleFormSuccess = () => {
		setEditingArtisan(null);
	};

	// Filter artisans
	const filteredArtisans = useMemo(() => {
		return artisans.filter((artisan: Artisan) => {
			// Search filter
			const matchesSearch =
				searchQuery === "" ||
				artisan.name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				artisan.location
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				artisan.specialization
					?.toLowerCase()
					.includes(searchQuery.toLowerCase());

			// Status filter (assuming artisans have a status field, or we can infer from other data)
			const matchesStatus = statusFilter === "all";

			return matchesSearch && matchesStatus;
		});
	}, [artisans, searchQuery, statusFilter]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-2">
					<User className="h-6 w-6" />
					<h1 className="text-3xl font-bold">Artisan Management</h1>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
						<Button
							size="sm"
							variant={viewMode === "grid" ? "default" : "ghost"}
							onClick={() => setViewMode("grid")}>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant={viewMode === "list" ? "default" : "ghost"}
							onClick={() => setViewMode("list")}>
							<List className="h-4 w-4" />
						</Button>
					</div>
					<Button onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-2" />
						Add Artisan
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col lg:flex-row gap-4 mb-6">
				<div className="flex items-center gap-2 flex-1">
					<Search className="h-4 w-4 text-gray-500" />
					<Input
						placeholder="Search by name, location, or specialization..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
				</div>
			</div>

			<div
				className={
					viewMode === "grid"
						? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						: "grid gap-4"
				}>
				{filteredArtisans.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">
								No artisans found
							</p>
						</CardContent>
					</Card>
				) : (
					filteredArtisans.map((artisan: Artisan) => (
						<Card
							key={artisan.id}
							className={viewMode === "list" ? "w-full" : ""}>
							{viewMode === "grid" ? (
								<>
									<CardHeader>
										<div className="aspect-square w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
											{artisan.image ? (
												<img
													src={artisan.image}
													alt={artisan.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<User className="w-16 h-16 text-gray-400" />
												</div>
											)}
										</div>
										<div>
											<Link to={`/artisan/${artisan.id}`}>
												<CardTitle className="text-sm hover:text-craft-brown cursor-pointer transition-colors">
													{artisan.name}
												</CardTitle>
											</Link>
											<p className="text-sm text-gray-600 mt-1 flex items-center">
												<MapPin className="w-3 h-3 mr-1" />
												{artisan.location}
											</p>
											<Badge className="mt-2 bg-craft-brown text-white text-xs">
												{artisan.specialization}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex space-x-1 mb-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													handleEdit(artisan)
												}>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => {
													if (
														confirm(
															"Are you sure you want to delete this artisan?"
														)
													) {
														deleteArtisanMutation.mutate(
															artisan.id
														);
													}
												}}>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
										<p className="text-xs text-gray-600">
											{artisan.experience &&
												`${artisan.experience} experience`}
										</p>
									</CardContent>
								</>
							) : (
								<>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div className="flex items-center space-x-3">
												{artisan.image ? (
													<img
														src={artisan.image}
														alt={artisan.name}
														className="w-16 h-16 rounded-full object-cover"
													/>
												) : (
													<div className="w-16 h-16 rounded-full bg-craft-brown flex items-center justify-center">
														<User className="w-8 h-8 text-white" />
													</div>
												)}
												<div>
													<Link
														to={`/artisan/${artisan.id}`}>
														<CardTitle className="hover:text-craft-brown cursor-pointer transition-colors">
															{artisan.name}
														</CardTitle>
													</Link>
													<CardDescription className="flex items-center mt-1">
														<MapPin className="w-4 h-4 mr-1" />
														{artisan.location}
													</CardDescription>
												</div>
											</div>
											<div className="text-right">
												<Badge className="bg-craft-brown text-white">
													{artisan.specialization}
												</Badge>
												{artisan.experience && (
													<p className="text-sm text-gray-600 mt-1">
														{artisan.experience}
													</p>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 gap-4 mb-4">
											<div>
												<p className="text-sm text-gray-500">
													Bio
												</p>
												<div
													className="text-sm text-gray-700 line-clamp-2"
													dangerouslySetInnerHTML={{
														__html: artisan.bio,
													}}
												/>
											</div>
										</div>
										<div className="flex space-x-2">
											<Button
												variant="outline"
												onClick={() =>
													handleEdit(artisan)
												}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="destructive"
												onClick={() => {
													if (
														confirm(
															"Are you sure you want to delete this artisan?"
														)
													) {
														deleteArtisanMutation.mutate(
															artisan.id
														);
													}
												}}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</>
							)}
						</Card>
					))
				)}
			</div>

			<ArtisanForm
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				editingArtisan={editingArtisan}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
