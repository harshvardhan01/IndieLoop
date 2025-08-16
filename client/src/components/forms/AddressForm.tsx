import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

interface AddressFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingAddress: Address | null;
	onSuccess?: () => void;
}

export default function AddressForm({
	isOpen,
	onOpenChange,
	editingAddress,
	onSuccess,
}: AddressFormProps) {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [addressForm, setAddressForm] = useState({
		firstName: editingAddress?.firstName || user?.firstName || "",
		lastName: editingAddress?.lastName || user?.lastName || "",
		streetAddress: editingAddress?.streetAddress || "",
		city: editingAddress?.city || "",
		state: editingAddress?.state || "",
		zipCode: editingAddress?.zipCode || "",
		country: editingAddress?.country || "",
		phone: editingAddress?.phone || "",
		isDefault: editingAddress?.isDefault || false,
	});

	// Update form when editingAddress changes
	useEffect(() => {
		setAddressForm({
			firstName: editingAddress?.firstName || user?.firstName || "",
			lastName: editingAddress?.lastName || user?.lastName || "",
			streetAddress: editingAddress?.streetAddress || "",
			city: editingAddress?.city || "",
			state: editingAddress?.state || "",
			zipCode: editingAddress?.zipCode || "",
			country: editingAddress?.country || "",
			phone: editingAddress?.phone || "",
			isDefault: editingAddress?.isDefault || false,
		});
	}, [editingAddress, user]);

	// Fetch countries for dropdown
	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});

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
			onOpenChange(false);
			resetForm();
			onSuccess?.();
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to save address. Please try again.",
				variant: "destructive",
			});
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
	};

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

	return (
		<Modal open={isOpen} onOpenChange={onOpenChange}>
			<ModalContent className="max-w-2xl">
				<ModalHeader>
					<ModalTitle>
						{editingAddress ? "Edit Address" : "Add New Address"}
					</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleSubmitAddress} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
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
						<Label htmlFor="streetAddress">Street Address</Label>
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
							<Label htmlFor="state">State/Province</Label>
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
							<Label htmlFor="zipCode">ZIP/Postal Code</Label>
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
						<Label htmlFor="phone">Phone Number (Optional)</Label>
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
							{editingAddress ? "Update Address" : "Add Address"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
					</div>
				</form>
			</ModalContent>
		</Modal>
	);
}
