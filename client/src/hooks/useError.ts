import { createContext, useContext, useState } from "react";

interface ErrorContextType {
	error: string | null;
	showError: (error: string) => void;
	clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
	undefined
);

export function useError() {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error("useError must be used within an ErrorProvider");
	}
	return context;
}

export function useErrorProvider() {
	const [error, setError] = useState<string | null>(null);

	const showError = (errorMessage: string) => {
		setError(errorMessage);
	};

	const clearError = () => {
		setError(null);
	};

	return {
		error,
		showError,
		clearError,
	};
}
