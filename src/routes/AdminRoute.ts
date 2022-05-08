import express, {Request, Response, NextFunction} from "express";
import { CreateVendor, GetDeliveryUsers, GetTransactionByID, GetTransactions, GetVendorByID, GetVendors, VerifyDeliveryUser } from "../controllers";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {

	return res.json({ message: "Hello from Admin."});
});

router.post("/vendor", CreateVendor);
router.get("/vendors", GetVendors);
router.get("/vendor/:id", GetVendorByID);


router.get("/transactions", GetTransactions);
router.get("/transactions/:id", GetTransactionByID);


router.put("/delivery/users/verify", VerifyDeliveryUser);
router.get("/delivery/users", GetDeliveryUsers);

export { router as AdminRoute };