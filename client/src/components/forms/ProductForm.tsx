import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingProduct: Product | null;
	onSuccess?: () => void;
}

export default function ProductForm({
	isOpen,
	onOpenChange,
	editingProduct,
	onSuccess,
}: ProductFormProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [productForm, setProductForm] = useState({
		asin: editingProduct?.asin || "",
		name: editingProduct?.name || "",
		description: editingProduct?.description || "",
		originalPrice: editingProduct?.originalPrice || "",
		discountedPrice: editingProduct?.discountedPrice || "",
		category: editingProduct?.category || "",
		material: editingProduct?.material || "",
		countryOfOrigin: editingProduct?.countryOfOrigin || "",
		artisanId: editingProduct?.artisanId || "none",
		images:
			editingProduct?.images && editingProduct?.images.length > 0
				? editingProduct.images
				: [""],
		dimensions: {
			length: editingProduct?.dimensions?.length?.toString() || "",
			width: editingProduct?.dimensions?.width?.toString() || "",
			height: editingProduct?.dimensions?.height?.toString() || "",
			unit: editingProduct?.dimensions?.unit || ("inch" as "inch" | "cm"),
		},
		weight: {
			value: editingProduct?.weight?.value?.toString() || "",
			unit: editingProduct?.weight?.unit || ("g" as "g" | "kg"),
		},
		inStock: editingProduct?.inStock ?? true,
	});

	// Update form when editingProduct changes
	useEffect(() => {
		setProductForm({
			asin: editingProduct?.asin || "",
			name: editingProduct?.name || "",
			description: editingProduct?.description || "",
			originalPrice: editingProduct?.originalPrice || "",
			discountedPrice: editingProduct?.discountedPrice || "",
			category: editingProduct?.category || "",
			material: editingProduct?.material || "",
			countryOfOrigin: editingProduct?.countryOfOrigin || "",
			artisanId: editingProduct?.artisanId || "none",
			images:
				editingProduct?.images && editingProduct?.images.length > 0
					? editingProduct.images
					: [""],
			dimensions: {
				length: editingProduct?.dimensions?.length?.toString() || "",
				width: editingProduct?.dimensions?.width?.toString() || "",
				height: editingProduct?.dimensions?.height?.toString() || "",
				unit:
					editingProduct?.dimensions?.unit ||
					("inch" as "inch" | "cm"),
			},
			weight: {
				value: editingProduct?.weight?.value?.toString() || "",
				unit: editingProduct?.weight?.unit || ("g" as "g" | "kg"),
			},
			inStock: editingProduct?.inStock ?? true,
		});
	}, [editingProduct]);

	// Fetch config data
	const { data: categories = [] } = useQuery<string[]>({
		queryKey: ["config", "categories"],
		queryFn: async () => {
			const response = await fetch("/api/config/categories");
			if (!response.ok) throw new Error("Failed to fetch categories");
			return response.json();
		},
	});

	const { data: materials = [] } = useQuery<string[]>({
		queryKey: ["config", "materials"],
		queryFn: async () => {
			const response = await fetch("/api/config/materials");
			if (!response.ok) throw new Error("Failed to fetch materials");
			return response.json();
		},
	});

	const { data: artisans = [] } = useQuery({
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

	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});

	// Create product mutation
	const createProductMutation = useMutation({
		mutationFn: async (productData: any) => {
			const response = await fetch("/api/admin/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify(productData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create product"
				);
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast({
				title: "Success",
				description: "Product created successfully",
			});
			onOpenChange(false);
			resetForm();
			onSuccess?.();
		},
		onError: (error: any) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	// Update product mutation
	const updateProductMutation = useMutation({
		mutationFn: async ({
			id,
			productData,
		}: {
			id: string;
			productData: any;
		}) => {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify(productData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to update product"
				);
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast({
				title: "Success",
				description: "Product updated successfully",
			});
			onOpenChange(false);
			resetForm();
			onSuccess?.();
		},
		onError: (error: any) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setProductForm({
			asin: "",
			name: "",
			description: "",
			originalPrice: "",
			discountedPrice: "",
			category: "",
			material: "",
			countryOfOrigin: "",
			artisanId: "none",
			images: [""],
			dimensions: {
				length: "",
				width: "",
				height: "",
				unit: "inch",
			},
			weight: {
				value: "",
				unit: "g",
			},
			inStock: true,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const productData = {
			...productForm,
			artisanId:
				productForm.artisanId === "none" ? null : productForm.artisanId,
			originalPrice: productForm.originalPrice,
			discountedPrice: productForm.discountedPrice || null,
			images: productForm.images.filter((img) => img.trim() !== ""),
			dimensions:
				productForm.dimensions.length && productForm.dimensions.width
					? {
							length:
								parseFloat(productForm.dimensions.length) || 0,
							width:
								parseFloat(productForm.dimensions.width) || 0,
							height:
								parseFloat(productForm.dimensions.height) || 0,
							unit: productForm.dimensions.unit,
					  }
					: null,
			weight: productForm.weight.value
				? {
						value: parseFloat(productForm.weight.value) || 0,
						unit: productForm.weight.unit,
				  }
				: null,
		};

		if (editingProduct) {
			updateProductMutation.mutate({
				id: editingProduct.id,
				productData,
			});
		} else {
			createProductMutation.mutate(productData);
		}
	};

	const addImageField = () => {
		setProductForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
	};

	const updateImageField = (index: number, value: string) => {
		setProductForm((prev) => ({
			...prev,
			images: prev.images.map((img, i) => (i === index ? value : img)),
		}));
	};

	const removeImageField = (index: number) => {
		setProductForm((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	return (
		<Modal open={isOpen} onOpenChange={onOpenChange}>
			<ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<ModalHeader>
					<ModalTitle>
						{editingProduct ? "Edit Product" : "Add New Product"}
					</ModalTitle>
				</ModalHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="asin">ASIN</Label>
							<Input
								id="asin"
								value={productForm.asin}
								onChange={(e) =>
									setProductForm((prev) => ({
										...prev,
										asin: e.target.value,
									}))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={productForm.name}
								onChange={(e) =>
									setProductForm((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={productForm.description}
							onChange={(e) =>
								setProductForm((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={productForm.category}
							onValueChange={(value) =>
								setProductForm((prev) => ({
									...prev,
									category: value,
								}))
							}>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="originalPrice">
								Original Price
							</Label>
							<Input
								id="originalPrice"
								value={productForm.originalPrice}
								onChange={(e) =>
									setProductForm((prev) => ({
										...prev,
										originalPrice: e.target.value,
									}))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="discountedPrice">
								Discounted Price
							</Label>
							<Input
								id="discountedPrice"
								value={productForm.discountedPrice}
								onChange={(e) =>
									setProductForm((prev) => ({
										...prev,
										discountedPrice: e.target.value,
									}))
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="material">Material</Label>
							<Select
								value={productForm.material}
								onValueChange={(value) =>
									setProductForm((prev) => ({
										...prev,
										material: value,
									}))
								}>
								<SelectTrigger>
									<SelectValue placeholder="Select material" />
								</SelectTrigger>
								<SelectContent>
									{materials.map((material) => (
										<SelectItem
											key={material}
											value={material}>
											{material}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="countryOfOrigin">
								Country of Origin
							</Label>
							<Select
								value={productForm.countryOfOrigin}
								onValueChange={(value) =>
									setProductForm((prev) => ({
										...prev,
										countryOfOrigin: value,
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
						<Label htmlFor="artisan">Artisan</Label>
						<Select
							value={productForm.artisanId}
							onValueChange={(value) =>
								setProductForm((prev) => ({
									...prev,
									artisanId: value,
								}))
							}>
							<SelectTrigger>
								<SelectValue placeholder="Select an artisan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No Artisan</SelectItem>
								{artisans.map((artisan: any) => (
									<SelectItem
										key={artisan.id}
										value={artisan.id}>
										{artisan.name} - {artisan.location} -{" "}
										{artisan.id}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Dimensions</Label>
							<div className="grid grid-cols-4 gap-2">
								<div>
									<Label htmlFor="length" className="text-xs">
										Length
									</Label>
									<Input
										id="length"
										type="number"
										placeholder="L"
										value={productForm.dimensions.length}
										onChange={(e) =>
											setProductForm((prev) => ({
												...prev,
												dimensions: {
													...prev.dimensions,
													length: e.target.value,
												},
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="width" className="text-xs">
										Width
									</Label>
									<Input
										id="width"
										type="number"
										placeholder="W"
										value={productForm.dimensions.width}
										onChange={(e) =>
											setProductForm((prev) => ({
												...prev,
												dimensions: {
													...prev.dimensions,
													width: e.target.value,
												},
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="height" className="text-xs">
										Height
									</Label>
									<Input
										id="height"
										type="number"
										placeholder="H"
										value={productForm.dimensions.height}
										onChange={(e) =>
											setProductForm((prev) => ({
												...prev,
												dimensions: {
													...prev.dimensions,
													height: e.target.value,
												},
											}))
										}
									/>
								</div>
								<div>
									<Label
										htmlFor="dimensionUnit"
										className="text-xs">
										Unit
									</Label>
									<Select
										value={productForm.dimensions.unit}
										onValueChange={(value: "inch" | "cm") =>
											setProductForm((prev) => ({
												...prev,
												dimensions: {
													...prev.dimensions,
													unit: value,
												},
											}))
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="inch">
												inch
											</SelectItem>
											<SelectItem value="cm">
												cm
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Weight</Label>
							<div className="grid grid-cols-2 gap-2">
								<div>
									<Input
										type="number"
										placeholder="Weight"
										value={productForm.weight.value}
										onChange={(e) =>
											setProductForm((prev) => ({
												...prev,
												weight: {
													...prev.weight,
													value: e.target.value,
												},
											}))
										}
									/>
								</div>
								<div>
									<Select
										value={productForm.weight.unit}
										onValueChange={(value: "g" | "kg") =>
											setProductForm((prev) => ({
												...prev,
												weight: {
													...prev.weight,
													unit: value,
												},
											}))
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="g">g</SelectItem>
											<SelectItem value="kg">
												kg
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Images</Label>
						{productForm.images.map((image, index) => (
							<div key={index} className="flex space-x-2">
								<Input
									value={image}
									onChange={(e) =>
										updateImageField(index, e.target.value)
									}
									placeholder="Image URL"
								/>
								{productForm.images.length > 1 && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => removeImageField(index)}>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							onClick={addImageField}>
							<Plus className="h-4 w-4 mr-2" />
							Add Image
						</Button>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="inStock"
							checked={productForm.inStock}
							onCheckedChange={(checked) =>
								setProductForm((prev) => ({
									...prev,
									inStock: checked as boolean,
								}))
							}
						/>
						<Label htmlFor="inStock">In Stock</Label>
					</div>

					<div className="flex space-x-2">
						<Button type="submit" className="flex-1">
							{editingProduct
								? "Update Product"
								: "Create Product"}
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
