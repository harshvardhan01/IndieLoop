import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Edit, Trash2, Home } from "lucide-react";
import AddressForm from "@/components/forms/AddressForm";

interface Address {
	id: string;
	firstName: string;
	lastName: string;
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone?: string;
	isDefault: boolean;
}

export default function Addresses() {
	const { user, isAuthenticated } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);

	// Fetch addresses from the backend
	const { data: addresses = [] } = useQuery<Address[]>({
		queryKey: ["addresses"],
		enabled: isAuthenticated,
		queryFn: async () => {
			const response = await fetch("/api/addresses", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch addresses");
			}
			return response.json();
		},
	});

	const openEditAddress = (address: Address) => {
		setEditingAddress(address);
		setIsAddressDialogOpen(true);
	};

	const handleFormSuccess = () => {
		setEditingAddress(null);
	};

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/addresses/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete address");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast({
				title: "Success",
				description: "Address deleted successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to delete address. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleDeleteAddress = (id: string) => {
		deleteMutation.mutate(id);
	};

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Please log in to view your addresses.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-2">
					<MapPin className="h-6 w-6" />
					<h1 className="text-3xl font-bold">My Addresses</h1>
				</div>
				<Button
					onClick={() => {
						setEditingAddress(null);
						setIsAddressDialogOpen(true);
					}}>
					<Plus className="h-4 w-4 mr-2" />
					Add Address
				</Button>
					
			</div>

			<div className="grid gap-6">
				{addresses.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No addresses yet
							</h3>
							<p className="text-gray-600 mb-6">
								Add an address to make checkout faster.
							</p>
							<Button
								onClick={() => {
									setEditingAddress(null);
									setIsAddressDialogOpen(true);
								}}>
								<Plus className="h-4 w-4 mr-2" />
								Add Your First Address
							</Button>
						</CardContent>
					</Card>
				) : (
					addresses.map((address) => (
						<Card key={address.id}>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-2">
										<CardTitle className="flex items-center gap-2">
											<Home className="h-5 w-5" />
											{address.firstName}{" "}
											{address.lastName}
											{address.isDefault && (
												<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
													Default
												</span>
											)}
										</CardTitle>
									</div>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												openEditAddress(address)
											}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() =>
												handleDeleteAddress(address.id)
											}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-1 text-gray-700">
									<p>{address.streetAddress}</p>
									<p>
										{address.city}, {address.state}{" "}
										{address.zipCode}
									</p>
									<p>{address.country}</p>
									{address.phone && (
										<p>Phone: {address.phone}</p>
									)}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			<AddressForm
				isOpen={isAddressDialogOpen}
				onOpenChange={setIsAddressDialogOpen}
				editingAddress={editingAddress}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
