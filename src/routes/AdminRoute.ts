import express, {Request, Response, NextFunction} from "express";
import { CreateVendor, GetTransactionByID, GetTransactions, GetVendorByID, GetVendors } from "../controllers";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {

	return res.json({ message: "Hello from Admin."});
});

router.post("/vendor", CreateVendor);
router.get("/vendors", GetVendors);
router.get("/vendor/:id", GetVendorByID);


router.get("/transactions", GetTransactions);
router.get("/transactions/:id", GetTransactionByID);

export { router as AdminRoute };