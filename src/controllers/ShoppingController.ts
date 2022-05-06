import { Request, Response, NextFunction } from "express";
import { FoodDoc, Vendor } from "../models";

export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {

	const zipcode = req.params.zipcode;

	const result = await Vendor.find({ zipcode, serviceAvailability: true })
		.sort([[ "rating", "descending" ]])
		.populate("foods");

	if(result.length > 0) {
		return res.json({ success: true, message: result });
	}

	return res.status(401).json({ success: false, message: "Unable to find food availability." });
}

export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {

	const zipcode = req.params.zipcode;

	const result = await Vendor.find({ zipcode, serviceAvailability: true })
		.sort([[ "rating", "descending" ]])
		.limit(10);

	if(result.length > 0) {
		return res.json({ success: true, message: result });
	}

	return res.status(401).json({ success: false, message: "Unable to find top restaurants." });
}

export const GetFoodIn30Min = async (req: Request, res: Response, next: NextFunction) => {
		
	const zipcode = req.params.zipcode;

	const result = await Vendor.find({ zipcode, serviceAvailability: true })
		.populate("foods");

	if(result.length > 0) {
		
		let filteredFood: any = [];
		
		result.map(vendor => {
			const foods = vendor.foods as [FoodDoc];

			filteredFood.push(...foods.filter(food => food.readyTime <= 30));
		});
		return res.json({ success: true, message: filteredFood });
	}

	return res.status(401).json({ success: false, message: "Unable to find food available in 30 minutes." });
}

export const SearchFood = async (req: Request, res: Response, next: NextFunction) => {
	
	const zipcode = req.params.zipcode;

	const result = await Vendor.find({ zipcode, serviceAvailability: true })
		.populate("foods");

	if(result.length > 0) {

		let foodResults: any = [];

		result.map( item => foodResults.push(...item.foods));
		
		return res.json({ success: true, message: foodResults });
	}

	return res.status(401).json({ success: false, message: "Unable to find food available in this zipcode." });
	
}

export const GetRestaurantByID = async (req: Request, res: Response, next: NextFunction) => {
	
	const id = req.params.id;

	const result = await Vendor.findById(id).populate("foods");

	if(result) {
		
		return res.json({ success: true, message: result });
	}

	return res.status(401).json({ success: false, message: "Unable to find restaurant by ID." });
}