import express, { Request, Response, NextFunction } from "express";
import { CreateOrder, CustomerLogin, CustomerSignUp, CustomerVerify,
	EditCustomerProfile, GetCustomerProfile, GetOrderById, GetOrders, RequestOTP } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Customer."});
});

// Signup / Create Customer
router.post("/signup", CustomerSignUp);

// Login
router.post("/login", CustomerLogin);

// Authenticate below routes
router.use(Authenticate);

// Verify Customer Account
router.patch("/verify", CustomerVerify);

// OTP / Requesting OTP
router.get("/otp", RequestOTP);

// Profile
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);


// TODO
// Cart
// Payments

// Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/orders/:id", GetOrderById);

export { router as CustomerRoute };