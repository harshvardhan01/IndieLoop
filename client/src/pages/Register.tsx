import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
	const [, setLocation] = useLocation();
	const { toast } = useToast();

	const form = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
		},
	});

	const registerMutation = useMutation({
		mutationFn: async (data: RegisterData) => {
			const response = await apiRequest(
				"POST",
				"/api/auth/register",
				data
			);
			return response.json();
		},
		onSuccess: (data) => {
			localStorage.setItem("sessionId", data.sessionId);
			toast({
				title: "Welcome to IndieLoop!",
				description: "Your account has been created successfully.",
			});
			setLocation("/");
		},
		onError: (error: Error) => {
			toast({
				title: "Registration failed",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = (data: RegisterData) => {
		registerMutation.mutate(data);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-display font-bold text-craft-brown">
						IndieLoop
					</h1>
					<p className="text-sm text-gray-600 mt-1">
						Artisan Crafted
					</p>
				</div>

				<Card className="shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-display font-bold text-craft-brown">
							Join IndieLoop
						</CardTitle>
						<CardDescription>
							Create your account to start supporting artisans
							worldwide
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													First Name
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="text"
														placeholder="First name"
														className="focus:ring-craft-brown focus:border-craft-brown"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="text"
														placeholder="Last name"
														className="focus:ring-craft-brown focus:border-craft-brown"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Email Address *
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="email"
													placeholder="Enter your email"
													className="focus:ring-craft-brown focus:border-craft-brown"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password *</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="password"
													placeholder="Create a password"
													className="focus:ring-craft-brown focus:border-craft-brown"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									disabled={registerMutation.isPending}
									className="w-full bg-craft-brown hover:bg-craft-brown/90">
									{registerMutation.isPending
										? "Creating account..."
										: "Create Account"}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<Link href="/login">
									<Button
										variant="link"
										className="p-0 text-craft-brown font-medium hover:underline">
										Sign in
									</Button>
								</Link>
							</p>
						</div>

						<div className="mt-6 text-xs text-gray-500 text-center">
							By creating an account, you agree to support
							independent artisans and discover authentic
							handcrafted products from around the world.
						</div>
					</CardContent>
				</Card>

				<div className="text-center">
					<Link href="/">
						<Button variant="link" className="text-craft-brown">
							← Back to shopping
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
