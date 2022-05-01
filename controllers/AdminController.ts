import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword } from "../utilities";

export const FindVendor = async (id: string | undefined, email?: string) => {
	
	return email ? await Vendor.findOne({email}) : await Vendor.findById(id);
}

export const CreateVendor = async (req: Request, res: Response, next: NextFunction ) => {
	const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body;

	const isVendorExisting = await FindVendor('', email);
	
	if (isVendorExisting !== null) {
		return res.status(400).json({ message: "Vendor exists already."});
	}

	const userPassword = await GeneratePassword(password);

	const createVendor = await Vendor.create({
		name, address, pincode, foodType, email, ownerName, phone,
		password: userPassword,
		rating: 0,
		coverImages: []
	});
	
	res.json(createVendor);
}

export const GetVendors = async (req: Request, res: Response, next: NextFunction ) => {

	const vendors = await Vendor.find();

	if (vendors !== null) {
		return res.json({vendors});
	}

	return res.status(400).json({ message: "Vendors not found." });
	
}
export const GetVendorByID = async (req: Request, res: Response, next: NextFunction ) => {

	const vendor = await FindVendor(req.params.id);

	if (vendor !== null) {
		return res.json(vendor);
	}

	return res.status(400).json({ message: "Vendor not found." });
}