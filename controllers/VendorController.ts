import { Request, Response, NextFunction } from "express";
import { VendorLoginInputs } from "../dto";
import { validatePassword } from "../utilities";
import { FindVendor } from "./AdminController";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
	
	const { email, password } = <VendorLoginInputs>req.body;

	const isVendorExisting = await FindVendor('', email);

	if (isVendorExisting !== null) {

		// Check password and authenticate

		const isValidPassword = await validatePassword(password, isVendorExisting.password);

		if (isValidPassword) {
			return res.json(isVendorExisting);
		}
	}

	return res.status(401).json({ message: "User does not exist." });
}