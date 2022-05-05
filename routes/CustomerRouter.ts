import express, {Request, Response, NextFunction } from "express";
import { CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOTP } from "../controllers";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Customer."});
});

// Signup / Create Customer
router.post("/signup", CustomerSignUp);

// Login
router.post("/login", CustomerLogin);

// Verify Customer Account
router.patch("/verify", CustomerVerify);

// OTP / Requesting OTP
router.get("/otp", RequestOTP);

// Profile
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);


// TODO
// Cart
// Order
// Payments

export { router as CustomerRoute };