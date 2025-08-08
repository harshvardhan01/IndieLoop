import { sql } from "drizzle-orm";
import {
	pgTable,
	text,
	varchar,
	integer,
	decimal,
	timestamp,
	jsonb,
	boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	description: text("description").notNull(),
	originalPrice: decimal("original_price", {
		precision: 10,
		scale: 2,
	}).notNull(),
	discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
	material: text("material").notNull(),
	countryOfOrigin: text("country_of_origin").notNull(),
	images: jsonb("images").$type<string[]>().notNull(),
	dimensions: text("dimensions"),
	weight: text("weight"),
	inStock: boolean("in_stock").default(true),
	createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	productId: varchar("product_id").notNull(),
	userId: varchar("user_id").notNull(),
	rating: integer("rating").notNull(),
	comment: text("comment"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	userId: varchar("user_id").notNull(),
	items: jsonb("items")
		.$type<Array<{ productId: string; quantity: number; price: number }>>()
		.notNull(),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").notNull().default("INR"),
	status: text("status").notNull().default("pending"),
	trackingNumber: text("tracking_number"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	userId: varchar("user_id").notNull(),
	productId: varchar("product_id").notNull(),
	quantity: integer("quantity").notNull().default(1),
	createdAt: timestamp("created_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	message: text("message").notNull(),
	status: text("status").notNull().default("open"),
	createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
	id: true,
	createdAt: true,
});
export const insertProductSchema = createInsertSchema(products).omit({
	id: true,
	createdAt: true,
});
export const insertReviewSchema = createInsertSchema(reviews).omit({
	id: true,
	createdAt: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
	id: true,
	createdAt: true,
});
export const insertCartItemSchema = createInsertSchema(cartItems).omit({
	id: true,
	createdAt: true,
});
export const insertSupportMessageSchema = createInsertSchema(
	supportMessages
).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;

// Auth schemas
export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
