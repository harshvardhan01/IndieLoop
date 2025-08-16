import type { Express } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import addressRoutes from "./routes/addressRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import cartRoutes from "./routes/cartRoutes";
import artisanRoutes from "./routes/artisanRoutes";
import supportRoutes from "./routes/supportRoutes";
import configRoutes from "./routes/configRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
	// Register all route modules
	app.use("/api/auth", authRoutes);
	app.use("/api/products", productRoutes);
	app.use("/api/addresses", addressRoutes);
	app.use("/api/orders", orderRoutes);
	app.use("/api/admin", adminOrderRoutes);
	app.use("/api/cart", cartRoutes);
	app.use("/api/artisans", artisanRoutes);
	app.use("/api/support", supportRoutes);
	app.use("/api/config", configRoutes);

	// Admin route aliases for backward compatibility
	app.use("/api/admin/orders", orderRoutes);
	app.use("/api/admin/products", productRoutes);
	app.use("/api/admin/support", supportRoutes);

	const httpServer = createServer(app);
	return httpServer;
}
