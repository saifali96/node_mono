import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateDeliveryUserInputs, EditDeliveryUserInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GeneratePassword, GenerateSignature, validatePassword } from "../utilities";
import { DeliveryUser } from "../models";

export const DeliveryUserSignUp = async (req: Request, res: Response, next: NextFunction) => {

	const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);
	const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true }});

	if(inputErrors.length > 0) {
		return res.status(400).json({ success: false, message: inputErrors });
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

		return res.status(400).json({ success: false, message: loginErrors });
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

	const deliveryUser = req.user;

	if (deliveryUser) {
				
		const deliveryUserProfile = await DeliveryUser.findById(deliveryUser._id);

		if(deliveryUserProfile) {

			return res.status(200).json({ success: true, message: deliveryUserProfile });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to fetch delivery user profile." });
}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

	const deliveryUser = req.user;

	const profileInputs = plainToClass(EditDeliveryUserInputs, req.body);

	const profileErrors = await validate(profileInputs, { validationError: { target: false }});

	if (profileErrors.length > 0) {

		return res.status(400).json(profileErrors);
	}

	const { firstName, lastName, address, zipcode } = profileInputs;

	if (deliveryUser) {
				
		const deliveryUserProfile = await DeliveryUser.findById(deliveryUser._id);

		if(deliveryUserProfile) {
			
			deliveryUserProfile.firstName = firstName;
			deliveryUserProfile.lastName = lastName;
			deliveryUserProfile.address = address;
			deliveryUserProfile.zipcode = zipcode;

			const result = await deliveryUserProfile.save();

			if(result) {
				return res.status(200).json({ success: true, message: result });
			}
		}
	}

	return res.status(400).json({ success: false, message: "Failed to edit delivery profile." });

}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

	const deliveryUser = req.user;

	if(deliveryUser) {

		const profile = await DeliveryUser.findById(deliveryUser._id);

		if(profile) {
			
			profile.isAvailable = !profile.isAvailable;
			const result = await profile.save();

			if(result){
				return res.status(200).json({ success: true, message: result });
			}
		}

	}

	return res.status(400).json({ success: false, message: "Failed to update delivery user status." });

}

export const UpdateDeliveryUserGeo = async (req: Request, res: Response, next: NextFunction) => {

	const deliveryUser = req.user;

	if(deliveryUser) {

		const { geoData } = req.body;
		
		if(!geoData.lat && !geoData.lng) {
			return res.status(400).json({ success: false, message: "Failed to update geoData. GeoData missing." });
		}

		const profile = await DeliveryUser.findById(deliveryUser._id);

		if(profile) {
			
			profile.geoData = geoData;
			const result = await profile.save();

			if(result){
				return res.status(200).json({ success: true, message: result });
			}
		}

	}

	return res.status(400).json({ success: false, message: "Failed to update delivery user geoData." });
}
