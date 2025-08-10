
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
	error: string | null;
	onDismiss: () => void;
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (error) {
			setIsVisible(true);
			// Auto-dismiss after 5 seconds
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(onDismiss, 300); // Allow fade out animation
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [error, onDismiss]);

	if (!error || !isVisible) return null;

	// Clean error message to remove technical details
	const cleanError = error
		.replace(/^\d+:\s*/, '') // Remove error codes like "404: "
		.replace(/Error:\s*/, '') // Remove "Error: " prefix
		.replace(/Failed to fetch/, 'Network connection issue')
		.replace(/Internal server error/, 'Something went wrong on our end');

	return (
		<div 
			className={`fixed top-16 left-0 right-0 z-50 p-4 transition-all duration-300 ${
				isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
			}`}
		>
			<div className="max-w-7xl mx-auto">
				<Alert variant="destructive" className="border-red-200 bg-red-50">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription className="flex justify-between items-center">
						<span>{cleanError}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsVisible(false);
								setTimeout(onDismiss, 300);
							}}
							className="hover:bg-red-100 ml-4"
						>
							<X className="h-4 w-4" />
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}
