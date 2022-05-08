import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GeneratePassword } from "../utilities";

export const FindVendor = async (id: string | undefined, email?: string) => {
	
	return email ? await Vendor.findOne({email}) : await Vendor.findById(id);
}

export const CreateVendor = async (req: Request, res: Response, next: NextFunction ) => {
	const { name, address, zipcode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body;

	const isVendorExisting = await FindVendor('', email);
	
	if (isVendorExisting !== null) {
		return res.status(400).json({success: true, message: "Vendor exists already."});
	}

	const userPassword = await GeneratePassword(password);

	const createVendor = await Vendor.create({
		name, address, zipcode, foodType, email, ownerName, phone,
		password: userPassword,
		rating: 0,
		coverImages: [],
		foods: [],
		geoData: { lng: 0.0, lat: 0.0 }
	});
	
	return res.status(201).json({ success: true, message: createVendor });
}

export const GetVendors = async (req: Request, res: Response, next: NextFunction ) => {

	const vendors = await Vendor.find();

	if (vendors !== null) {
		return res.status(200).json({ success: true, message: vendors});
	}

	return res.status(400).json({ success: true, message: "Vendors not found." });
	
}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction ) => {

	const vendor = await FindVendor(req.params.id);

	if (vendor !== null) {
		return res.json({ success: true, message: vendor});
	}

	return res.status(200).status(400).json({ success: true, message: "Vendor not found." });
}

export const GetTransactions = async (req: Request, res: Response, next: NextFunction ) => {

	const transactions = await Transaction.find();

	if (transactions) {
		
		return res.status(200).json({ success: true, message: transactions });
	}

	return res.status(400).json({ success: true, message: "Transactions not found." });
}

export const GetTransactionByID = async (req: Request, res: Response, next: NextFunction ) => {

	const transaction = await Transaction.findById(req.params.id);

	if (transaction) {

		return res.status(200).json({ success: true, message: transaction });
	}

	return res.status(400).json({ success: true, message: "Transaction not found." });
}

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction ) => {

	const { id, status } = req.body;

	if (id) {

		const profile = await DeliveryUser.findById(id);

		if(profile) {
			profile.verified = status;

			const result = await profile.save();

			if(result) {
				return res.status(200).json({ success: true, message: result });
			}
		}
	}

	return res.status(400).json({ success: true, message: "Could not verify delivery user." });
}

export const GetDeliveryUsers = async (req: Request, res: Response, next: NextFunction ) => {

	const deliveryUsers = await DeliveryUser.find();
	if (deliveryUsers) {
		
		return res.status(200).json({ success: true, message: deliveryUsers });
	}

	return res.status(400).json({ success: true, message: "Could not get delivery users." });
}