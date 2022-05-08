import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateDeliveryUserInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GeneratePassword, GenerateSignature, validatePassword } from "../utilities";
import { DeliveryUser } from "../models";

export const DeliveryUserSignUp = async (req: Request, res: Response, next: NextFunction) => {

	const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);
	const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true }});

	if(inputErrors.length > 0) {
		return res.status(400).json(inputErrors);
	}

	const { email, phone, password, address, firstName, lastName, zipcode } = deliveryUserInputs;

	const isDeliveryUserExisting = await DeliveryUser.findOne({ email });
	
	if (isDeliveryUserExisting !== null) {
		return res.status(400).json({ message: "Delivery user exists already."});
	}

	const userPassword = await GeneratePassword(password);
	
	const result = await DeliveryUser.create({
		email,
		password: userPassword,
		phone,
		firstName,
		lastName,
		zipcode,
		address,
		verified: false,
		isAvailable: false,
		geoData: {
			lng: 0,
			lat: 0
		},
		orders: []

	});

	if(result) {
		
		// Generate the JWT
		const signature = await GenerateSignature({
			_id: result._id,
			email: result.email,
			verified: result.verified
		});

		// Send the result to client
		return res.status(201).json({ success: true, message: { signature, verified: result.verified, email: result.email }});
	}

	return res.status(400).json({ success: false, message: "Failed to signup delivery user." });
}

export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {

	const loginInputs = plainToClass( UserLoginInputs, req.body );
	const loginErrors = await validate(loginInputs, { validationError: { target: false }});

	if (loginErrors.length > 0) {

		return res.status(400).json(loginErrors);
	}

	const { email, password } = loginInputs;
	const deliveryUser = await DeliveryUser.findOne({ email });

	if(deliveryUser) {
		
		const isValidPassword = await validatePassword(password, deliveryUser.password);
		
		if(isValidPassword) {

			const signature = await GenerateSignature({
				_id: deliveryUser._id,
				email: deliveryUser.email,
				verified: deliveryUser.verified
			});

			return res.status(200).json({ success: true, message: { signature, verified: deliveryUser.verified, email: deliveryUser.email }});
		}
	}

	return res.status(400).json({ success: false, message: "Failed to login delivery user." });

}

export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

	// const customer = req.user;

	// if (customer) {
				
	// 	const customerProfile = await Customer.findById(customer._id);

	// 	if(customerProfile) {

	// 		return res.status(200).json({ success: true, message: customerProfile });
	// 	}
	// }

	// return res.status(400).json({ success: false, message: "Failed to fetch customer profile." });
}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

	// const customer = req.user;

	// const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

	// const profileErrors = await validate(profileInputs, { validationError: { target: false }});

	// if (profileErrors.length > 0) {

	// 	return res.status(400).json(profileErrors);
	// }

	// const { firstName, lastName, address } = profileInputs;

	// if (customer) {
				
	// 	const customerProfile = await Customer.findById(customer._id);

	// 	if(customerProfile) {
			
	// 		customerProfile.firstName = firstName;
	// 		customerProfile.lastName = lastName;
	// 		customerProfile.address = address;

	// 		const result = await customerProfile.save();

	// 		return res.status(200).json({ success: true, message: result });
	// 	}
	// }

	// return res.status(400).json({ success: false, message: "Failed to edit customer profile." });

}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {
}

export const UpdateDeliveryUserGeo = async (req: Request, res: Response, next: NextFunction) => {
}
