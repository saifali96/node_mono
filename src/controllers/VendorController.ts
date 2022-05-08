import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVendorInputs, VendorLoginInputs } from "../dto";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food, Offer } from "../models";
import { Order } from "../models/Order";
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

		return res.status(201).json({ success: true, message: vendor });
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
			return res.status(201).json({ success: true, message: savedResult });

		}

		return res.status(201).json({ success: true, message: vendor });
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

			return res.status(201).json({ success: true, message: result });
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
			return res.status(201).json({ success: true, message: savedResult });
		}

		return res.status(201).json({ success: true, message: vendor });
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

			return res.status(201).json({ success: true, message: result });
		}
		
	}

	return res.status(400).json({ success: false, message: "Could not add food." });
	
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if (user) {

		const foods = await Food.find({ vendorID: user._id });

		if (foods !== null) {
			
			return res.status(201).json({ success: true, message: foods });
		}
		 
	}

	return res.status(400).json({ success: false, message: "Could not fetch foods." });
	
}

export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if(user) {

		const orders = await Order.find({ orderedFrom: user._id }).populate("items.food");

		if(orders) {

			return res.status(201).json({ success: true, message: orders });
		}
	}

	return res.status(400).json({ success: false, message: "Could not fetch orders." });
	 
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

	const orderID = req.params.id;

	if(orderID) {

		const order = await Order.findById(orderID).populate("items.food");

		if(order && order.orderedFrom == req.user?._id) {

			return res.status(201).json({ success: true, message: order });
		}
	}

	return res.status(400).json({ success: false, message: "Could not fetch order details." });

}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

	const orderID = req.params.id;

	// TODO - Input sanitation and validation
	const { status, remarks, time } = req.body;			// ACCEPTED - REJECTED - PROCESSING - READY

	if(orderID){
		
		const order = await Order.findById(orderID).populate("items");

		if(order && order.orderedFrom == req.user?._id) {
			order.orderStatus = status;
			order.remarks = remarks;
			order.readyTime = time;

			const orderResult = await order.save();

			if(orderResult) {
				
				return res.status(201).json({ success: true, message: orderResult });
			}
		}
	}

	return res.status(400).json({ success: false, message: "Could not process order." });
}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if(user) {

		const vendorOffers = await Offer.find({ vendors: user._id }).populate("vendors");
		const genericOffers = await Offer.find({ offerType: "GENERIC" }).populate("vendors");

		if(vendorOffers || genericOffers) {

			if(genericOffers) {
				const offers = vendorOffers.concat(genericOffers);
				return res.status(201).json({ success: true, message: offers });
			}

			return res.status(201).json({ success: true, message: vendorOffers });
		}
	}

	return res.status(400).json({ success: false, message: "Could not get offer." });

}

export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;

	if(user) {
		const { title, description, offerType, offerAmount, zipCode,
		promoCode, promoType, validFrom, validUntil, bank, bins, minValue, maxValue, isActive } = <CreateOfferInputs>req.body;

		const vendor = await FindVendor(user._id);

		if(vendor) {

			const offer = await Offer.create({
				title, description, offerType, offerAmount, zipCode,
				promoCode, promoType, validFrom, validUntil, bank, bins, minValue, maxValue, isActive,
				vendors: [vendor.id]
			});

			return res.status(201).json({ success: true, message: offer });
		}
	}

	return res.status(400).json({ success: false, message: "Could not add offer." });

}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {

	const user = req.user;
	const offerID = req.params.id;

	if(user) {
		const { title, description, offerType, offerAmount, zipCode,
		promoCode, promoType, validFrom, validUntil, bank, bins, minValue, maxValue, isActive } = <CreateOfferInputs>req.body;

		const currentOffer = await Offer.findById(offerID);

		if(currentOffer) {
			
			const vendor = await FindVendor(user._id);

			if(vendor) {

					currentOffer.title = title;
					currentOffer.description = description;
					currentOffer.offerType = offerType;
					currentOffer.offerAmount = offerAmount;
					currentOffer.zipCode = zipCode;
					currentOffer.promoCode = promoCode;
					currentOffer.promoType = promoType;
					currentOffer.validFrom = validFrom;
					currentOffer.validUntil = validUntil;
					currentOffer.bank = bank;
					currentOffer.bins = bins;
					currentOffer.minValue = minValue;
					currentOffer.maxValue = maxValue;
					currentOffer.isActive = isActive;

					const result = await currentOffer.save();

					return res.status(201).json({ success: true, message: result });
			}
		}
	}

	return res.status(400).json({ success: false, message: "Could not add offer." });

}