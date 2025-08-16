
import {
	type Address,
	type InsertAddress,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IAddressStorage {
	getUserAddresses(userId: string): Promise<Address[]>;
	createAddress(addressData: InsertAddress): Promise<Address>;
	updateAddress(id: string, addressData: InsertAddress): Promise<Address | undefined>;
	deleteAddress(id: string): Promise<boolean>;
}

export class AddressStorage implements IAddressStorage {
	private addresses: Map<string, Address> = new Map();

	async getUserAddresses(userId: string): Promise<Address[]> {
		return Array.from(this.addresses.values()).filter(
			(address) => address.userId === userId
		);
	}

	async createAddress(insertAddress: InsertAddress): Promise<Address> {
		const id = randomUUID();
		const address: Address = {
			...insertAddress,
			id,
			isDefault: insertAddress.isDefault || false,
			createdAt: new Date(),
		};

		// If this address is set as default, unset all other default addresses for this user
		if (address.isDefault) {
			const userAddresses = Array.from(this.addresses.values()).filter(
				(addr) => addr.userId === address.userId
			);
			userAddresses.forEach((addr) => {
				if (addr.isDefault) {
					const updatedAddr = { ...addr, isDefault: false };
					this.addresses.set(addr.id, updatedAddr);
				}
			});
		}

		this.addresses.set(id, address);
		return address;
	}

	async updateAddress(id: string, insertAddress: InsertAddress): Promise<Address | undefined> {
		const existingAddress = this.addresses.get(id);
		if (!existingAddress) {
			return undefined;
		}

		// If this address is being set as default, unset all other default addresses for this user
		if (insertAddress.isDefault && !existingAddress.isDefault) {
			const userAddresses = Array.from(this.addresses.values()).filter(
				(addr) => addr.userId === existingAddress.userId
			);
			userAddresses.forEach((addr) => {
				if (addr.isDefault) {
					const updatedAddr = { ...addr, isDefault: false };
					this.addresses.set(addr.id, updatedAddr);
				}
			});
		}

		const updatedAddress: Address = {
			...existingAddress,
			...insertAddress,
			id,
		};
		this.addresses.set(id, updatedAddress);
		return updatedAddress;
	}

	async deleteAddress(id: string): Promise<boolean> {
		return this.addresses.delete(id);
	}
}

export const addressService = new AddressStorage();
