import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInputs } from "../dto";
import { GenerateSignature, validatePassword } from "../utilities";
import { FindVendor } from "./AdminController";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
	
	const { email, password } = <VendorLoginInputs>req.body;

	const isVendorExisting = await FindVendor('', email);

	if (isVendorExisting !== null) {

		// Check password and authenticate

		const isValidPassword = await validatePassword(password, isVendorExisting.password);

		if (isValidPassword) {

			const signature = await GenerateSignature({
				_id: isVendorExisting.id,
				email: isVendorExisting.email,
				name: isVendorExisting.name
			});
			return res.json({ success: true, message: signature });
		}
	}

	return res.status(401).json({ success: false, message: "User does not exist." });
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if (user) {

		const vendor = await FindVendor(user._id);

		return res.json(vendor);
	}

	return res.status(400).json({ success: false, message: "Vendor profile not found." });
	
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
	
	const { foodType, name, address, phone } = <EditVendorInputs>req.body;
	const user = req.user;

	if (user) {

		const vendor = await FindVendor(user._id);
		
		if(vendor !== null) {
			vendor.name = name;
			vendor.address = address;
			vendor.phone = phone;
			vendor.foodType = foodType;

			const savedResult = await vendor.save();
			return res.json(savedResult);

		}

		return res.json(vendor);
	}

	return res.status(400).json({ success: false, message: "Vendor profile not found." });
	
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if (user) {

		const vendor = await FindVendor(user._id);
		
		if(vendor !== null) {
			vendor.serviceAvailability = !vendor.serviceAvailability;
			
			const savedResult = await vendor.save();
			return res.json(savedResult);
		}

		return res.json(vendor);
	}

	return res.status(400).json({ success: false, message: "Vendor profile not found." });
	
}