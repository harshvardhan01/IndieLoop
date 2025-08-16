
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SupportMessage {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
	status: string;
	createdAt: string;
}

interface SupportTicketModalProps {
	ticket: SupportMessage | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onStatusChange: (ticketId: string, status: string) => void;
}

export default function SupportTicketModal({
	ticket,
	isOpen,
	onOpenChange,
	onStatusChange,
}: SupportTicketModalProps) {
	if (!ticket) return null;

	return (
		<Modal open={isOpen} onOpenChange={onOpenChange}>
			<ModalContent className="max-w-2xl">
				<ModalHeader>
					<ModalTitle>Support Ticket Details</ModalTitle>
				</ModalHeader>
				<div className="p-4">
					<div className="mb-4 flex justify-between items-center">
						<div>
							<h2 className="text-xl font-bold">
								{ticket.subject}
							</h2>
							<p className="text-sm text-gray-600">
								From: {ticket.firstName} {ticket.lastName} (
								{ticket.email})
							</p>
						</div>
						<p className="text-sm text-gray-500">
							{new Date(ticket.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div className="mb-4">
						<h4 className="font-semibold mb-2">Message</h4>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">
							{ticket.message}
						</p>
					</div>
					{ticket.phone && (
						<p className="text-sm text-gray-600 mb-4">
							Phone: {ticket.phone}
						</p>
					)}
					<div className="flex items-center gap-2">
						<Label className="text-sm font-medium">Status:</Label>
						<Select
							value={ticket.status}
							onValueChange={(status) =>
								onStatusChange(ticket.id, status)
							}>
							<SelectTrigger className="w-[150px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="new">New</SelectItem>
								<SelectItem value="in-progress">
									In Progress
								</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
