
import {
	type Artisan,
	type InsertArtisan,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IArtisanStorage {
	getArtisans(): Promise<Artisan[]>;
	getArtisanById(artisanId: string): Promise<Artisan | null>;
	createArtisan(artisanData: InsertArtisan): Promise<Artisan>;
	updateArtisan(artisanId: string, artisanData: InsertArtisan): Promise<Artisan>;
	deleteArtisan(artisanId: string): Promise<boolean>;
}

export class ArtisanStorage implements IArtisanStorage {
	private artisans = new Map<string, Artisan>();

	constructor() {
		this.initializeSampleArtisans();
	}

	private initializeSampleArtisans(): void {
		const sampleArtisans: Artisan[] = [
			{
				id: "artisan-1",
				name: "Ravi Kumar",
				bio: "A master weaver from Rajasthan, India, known for his intricate textile designs.",
				website: "https://example.com/ravikumar",
				countryOfOrigin: "India",
				createdAt: new Date(),
			},
			{
				id: "artisan-2",
				name: "Sofia Alvarez",
				bio: "A ceramic artist from Cusco, Peru, blending traditional techniques with modern aesthetics.",
				website: "https://example.com/sofiaalvarez",
				countryOfOrigin: "Peru",
				createdAt: new Date(),
			},
		];
		sampleArtisans.forEach((a) => this.artisans.set(a.id, a));
	}

	async getArtisans(): Promise<Artisan[]> {
		return Array.from(this.artisans.values());
	}

	async getArtisanById(artisanId: string): Promise<Artisan | null> {
		return this.artisans.get(artisanId) || null;
	}

	async createArtisan(artisanData: InsertArtisan): Promise<Artisan> {
		const id = randomUUID();
		const artisan: Artisan = {
			...artisanData,
			id,
			createdAt: new Date(),
		};
		this.artisans.set(id, artisan);
		console.log("Created artisan:", artisan);
		return artisan;
	}

	async updateArtisan(artisanId: string, artisanData: InsertArtisan): Promise<Artisan | null> {
		const existingArtisan = this.artisans.get(artisanId);
		if (!existingArtisan) {
			return null;
		}
		const updatedArtisan: Artisan = {
			...existingArtisan,
			...artisanData,
		};
		this.artisans.set(artisanId, updatedArtisan);
		console.log("Updated artisan:", updatedArtisan);
		return updatedArtisan;
	}

	async deleteArtisan(artisanId: string): Promise<boolean> {
		return this.artisans.delete(artisanId);
	}
}

export const artisanService = new ArtisanStorage();
