import express, { Request, Response, NextFunction } from "express";
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignUp, CustomerVerify,
	DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById,
	GetOrders, RequestOTP, VerifyOffer } from "../controllers";
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


// Cart
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

// Offers
router.get("/offers/verify/:id", VerifyOffer);

// Payments
router.post("/create-payment", CreatePayment);

// Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/orders/:id", GetOrderById);

export { router as CustomerRoute };