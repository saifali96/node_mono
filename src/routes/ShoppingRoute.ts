import express, {Request, Response, NextFunction } from "express";
import { GetAvailOffers, GetFoodAvailability, GetFoodIn30Min, GetRestaurantByID, GetTopRestaurants, SearchFood } from "../controllers";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Shopping."});
});

// Food Availability
router.get("/restaurant/food/availability/:zipcode", GetFoodAvailability);

// Top Restaurants
router.get("/restaurant/top/:zipcode", GetTopRestaurants);

// Available in 30 mins
router.get("/restaurant/food/30-min/:zipcode", GetFoodIn30Min);

// Search Food
router.get("/restaurant/food/:zipcode", SearchFood);

// Search Offers
router.get("/offers/:zipcode", GetAvailOffers);

// Find Restaurant by ID
router.get("/restaurant/:id", GetRestaurantByID);

export { router as ShoppingRoute };