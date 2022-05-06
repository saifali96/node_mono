import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInputs } from "../dto";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models";
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

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
	
	const user = req.user;

	if (user) {

		const vendor = await FindVendor(user._id);

		if(vendor !== null) {
			
			const files = req.files as [Express.Multer.File];
			const images = files.map((file: Express.Multer.File) => file.filename);

			vendor.coverImages.push(...images);

			const result = await vendor.save();

			return res.json(result);
		}
		
	}

	return res.status(400).json({ success: false, message: "Could not add cover image." });
	
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

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if (user) {

		const { name, description, category, foodType, readyTime, price } = <CreateFoodInputs>req.body;
		const vendor = await FindVendor(user._id);

		if(vendor !== null) {
			
			const files = req.files as [Express.Multer.File];

			const images = files.map((file: Express.Multer.File) => file.filename);

			const createdFood = await Food.create({
				vendorID: vendor._id,
				name,
				description,
				category,
				foodType,
				images,
				readyTime,
				price,
				rating: 0
			});

			vendor.foods.push(createdFood);
			const result = await vendor.save();

			return res.json(result);
		}
		
	}

	return res.status(400).json({ success: false, message: "Could not add food." });
	
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if (user) {

		const foods = await Food.find({ vendorID: user._id });

		if (foods !== null) {
			
			return res.json(foods);
		}
		 
	}

	return res.status(400).json({ success: false, message: "Could not fetch foods." });
	
}