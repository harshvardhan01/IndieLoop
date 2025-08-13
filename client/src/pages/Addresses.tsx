import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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

	const [addressForm, setAddressForm] = useState({
		firstName: "",
		lastName: "",
		streetAddress: "",
		city: "",
		state: "",
		zipCode: "",
		country: "",
		phone: "",
		isDefault: false,
	});

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

	// Fetch countries for dropdown
	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});

	const resetForm = () => {
		setAddressForm({
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			streetAddress: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
			phone: "",
			isDefault: false,
		});
		setEditingAddress(null);
	};

	const openEditAddress = (address: Address) => {
		setEditingAddress(address);
		setAddressForm(address);
		setIsAddressDialogOpen(true);
	};

	const addressMutation = useMutation({
		mutationFn: async (data: typeof addressForm) => {
			const url = editingAddress
				? `/api/addresses/${editingAddress.id}`
				: "/api/addresses";
			const method = editingAddress ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to save address");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast({
				title: "Success",
				description: editingAddress
					? "Address updated successfully"
					: "Address added successfully",
			});
			setIsAddressDialogOpen(false);
			resetForm();
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to save address. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleSubmitAddress = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (
			!addressForm.firstName ||
			!addressForm.lastName ||
			!addressForm.streetAddress ||
			!addressForm.city ||
			!addressForm.state ||
			!addressForm.zipCode ||
			!addressForm.country
		) {
			toast({
				title: "Error",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		addressMutation.mutate(addressForm);
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
				<Modal
					open={isAddressDialogOpen}
					onOpenChange={setIsAddressDialogOpen}>
					<ModalTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Add Address
						</Button>
					</ModalTrigger>
					<ModalContent className="max-w-2xl">
						<ModalHeader>
							<ModalTitle>
								{editingAddress
									? "Edit Address"
									: "Add New Address"}
							</ModalTitle>
						</ModalHeader>
						<form
							onSubmit={handleSubmitAddress}
							className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">
										First Name
									</Label>
									<Input
										id="firstName"
										value={addressForm.firstName}
										onChange={(e) =>
											setAddressForm((prev) => ({
												...prev,
												firstName: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={addressForm.lastName}
										onChange={(e) =>
											setAddressForm((prev) => ({
												...prev,
												lastName: e.target.value,
											}))
										}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="streetAddress">
									Street Address
								</Label>
								<Input
									id="streetAddress"
									value={addressForm.streetAddress}
									onChange={(e) =>
										setAddressForm((prev) => ({
											...prev,
											streetAddress: e.target.value,
										}))
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={addressForm.city}
										onChange={(e) =>
											setAddressForm((prev) => ({
												...prev,
												city: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="state">
										State/Province
									</Label>
									<Input
										id="state"
										value={addressForm.state}
										onChange={(e) =>
											setAddressForm((prev) => ({
												...prev,
												state: e.target.value,
											}))
										}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="zipCode">
										ZIP/Postal Code
									</Label>
									<Input
										id="zipCode"
										value={addressForm.zipCode}
										onChange={(e) =>
											setAddressForm((prev) => ({
												...prev,
												zipCode: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="country">Country</Label>
									<Select
										value={addressForm.country}
										onValueChange={(value) =>
											setAddressForm((prev) => ({
												...prev,
												country: value,
											}))
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select country" />
										</SelectTrigger>
										<SelectContent>
											{countries.map((country) => (
												<SelectItem
													key={country}
													value={country}>
													{country}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">
									Phone Number (Optional)
								</Label>
								<Input
									id="phone"
									value={addressForm.phone}
									onChange={(e) =>
										setAddressForm((prev) => ({
											...prev,
											phone: e.target.value,
										}))
									}
								/>
							</div>

							<div className="flex space-x-2">
								<Button type="submit" className="flex-1">
									{editingAddress
										? "Update Address"
										: "Add Address"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										setIsAddressDialogOpen(false)
									}>
									Cancel
								</Button>
							</div>
						</form>
					</ModalContent>
				</Modal>
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
								onClick={() => setIsAddressDialogOpen(true)}>
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
		</div>
	);
}
