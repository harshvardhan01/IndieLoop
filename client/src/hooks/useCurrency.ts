import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const currencies = [
	{ code: "INR", symbol: "₹", name: "Indian Rupee" },
	{ code: "USD", symbol: "$", name: "US Dollar" },
	{ code: "EUR", symbol: "€", name: "Euro" },
	{ code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export function useCurrency() {
	const [selectedCurrency, setSelectedCurrency] = useState(() => {
		return localStorage.getItem("selectedCurrency") || "INR";
	});

	const { data: rates = {} } = useQuery({
		queryKey: ["/api/currency-rates"],
		retry: false,
	});

	useEffect(() => {
		const previousCurrency = localStorage.getItem("selectedCurrency");
		localStorage.setItem("selectedCurrency", selectedCurrency);

		// Refresh the page if currency changed (but not on initial load)
		if (previousCurrency && previousCurrency !== selectedCurrency) {
			window.location.reload();
		}
	}, [selectedCurrency]);

	const formatPrice = (price: string | number, currency?: string) => {
		const currentCurrency = currency || selectedCurrency;
		const numPrice = typeof price === "string" ? parseFloat(price) : price;
		const ratesData = rates as Record<string, number>;
		const rate = ratesData[currentCurrency] || 1;
		const convertedPrice = numPrice * rate;

		const currencyInfo = currencies.find((c) => c.code === currentCurrency);
		const symbol = currencyInfo?.symbol || currentCurrency;

		return `${symbol} ${convertedPrice.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})}`;
	};

	return {
		selectedCurrency,
		setSelectedCurrency,
		currencies,
		formatPrice,
		rates,
	};
}
