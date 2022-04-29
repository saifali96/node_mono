import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utilities";

export const CreateVendor = async (req: Request, res: Response, next: NextFunction ) => {
	const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body;

	const isVendorExisting = await Vendor.findOne({ email });
	
	if (isVendorExisting !== null) {
		return res.json({ message: "Vendor exists already."});
	}

	const salt = await GenerateSalt();
	const userPassword = await GeneratePassword(password, salt);

	const createVendor = await Vendor.create({
		name, address, pincode, foodType, email, salt, ownerName, phone,
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

	return res.json({ message: "Vendors not found." });
	
}
export const GetVendorByID = async (req: Request, res: Response, next: NextFunction ) => {

	const vendor = await Vendor.findById(req.params.id);

	if (vendor !== null) {
		return res.json(vendor);
	}

	return res.json({ message: "Vendor not found." });
}