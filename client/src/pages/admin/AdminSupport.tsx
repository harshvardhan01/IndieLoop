
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { SupportMessage } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

export default function AdminSupport() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch support messages
	const { data: messages = [] } = useQuery<SupportMessage[]>({
		queryKey: ["admin", "support"],
		queryFn: async () => {
			const response = await fetch("/api/admin/support", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch support messages");
			return response.json();
		},
	});

	// Update support message status mutation
	const updateMessageStatusMutation = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const response = await fetch(`/api/admin/support/${id}/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify({ status }),
			});
			if (!response.ok) throw new Error("Failed to update message status");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
			toast({
				title: "Success",
				description: "Message status updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update message status",
				variant: "destructive",
			});
		},
	});

	// Only render admin content if user is an admin
	if (!user || !user.isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				You do not have permission to view this page.
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center gap-2 mb-8">
				<MessageSquare className="h-6 w-6" />
				<h1 className="text-3xl font-bold">Support Messages</h1>
			</div>

			<div className="grid gap-6">
				{messages.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">No support messages found</p>
						</CardContent>
					</Card>
				) : (
					messages.map((message) => (
						<Card key={message.id}>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>{message.subject}</CardTitle>
										<CardDescription>
											From: {message.firstName} {message.lastName} ({message.email})
										</CardDescription>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-500">
											{new Date(message.createdAt).toLocaleDateString()}
										</p>
										<p
											className={`text-sm px-2 py-1 rounded mt-1 ${
												message.status === "resolved"
													? "bg-green-100 text-green-800"
													: message.status === "in-progress"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}`}>
											{message.status.toUpperCase().replace("-", " ")}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="mb-4">
									<h4 className="font-semibold mb-2">Message</h4>
									<p className="text-sm text-gray-700 whitespace-pre-wrap">
										{message.message}
									</p>
								</div>

								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<label className="text-sm font-medium">Status:</label>
										<Select
											value={message.status}
											onValueChange={(status) =>
												updateMessageStatusMutation.mutate({
													id: message.id,
													status,
												})
											}>
											<SelectTrigger className="w-[150px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="new">New</SelectItem>
												<SelectItem value="in-progress">In Progress</SelectItem>
												<SelectItem value="resolved">Resolved</SelectItem>
											</SelectContent>
										</Select>
									</div>
									{message.phone && (
										<p className="text-sm text-gray-600">Phone: {message.phone}</p>
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
