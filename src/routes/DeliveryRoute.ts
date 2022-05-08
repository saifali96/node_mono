import express, { Request, Response, NextFunction } from "express";
import { DeliveryUserLogin, DeliveryUserSignUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserGeo, UpdateDeliveryUserStatus } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Customer."});
});

// Signup / Create Customer
router.post("/signup", DeliveryUserSignUp);

// Login
router.post("/login", DeliveryUserLogin);

// Authenticate below routes
router.use(Authenticate);

// Profile
router.get("/profile", GetDeliveryUserProfile);

router.patch("/profile", EditDeliveryUserProfile);

// Delivery
router.put("/update-status", UpdateDeliveryUserStatus);
router.put("/update-geo", UpdateDeliveryUserGeo);


export { router as DeliveryRoute };