import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs, EditCustomerProfileInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSignature, onRequestOTP, validatePassword } from "../utilities";
import { Customer } from "../models/Customer";

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

	const customerInputs = plainToClass(CreateCustomerInputs, req.body);
	const inputErrors = await validate(customerInputs, { validationError: { target: true }});

	if(inputErrors.length > 0) {
		return res.status(400).json(inputErrors);
	}

	const { email, phone, password } = customerInputs;

	const isCustomerExisting = await Customer.findOne({ email });
	
	if (isCustomerExisting !== null) {
		return res.status(400).json({ message: "Customer exists already."});
	}

	const userPassword = await GeneratePassword(password);
	
	const { otp, expiry } = GenerateOtp();

	const result = await Customer.create({
		email,
		password: userPassword,
		phone,
		otp,
		otp_expiry: expiry,
		firstName: '',
		lastName: '',
		verified: false,
		lat: 0,
		lng: 0

	});

	if(result) {

		// Send OTP to customer
		await onRequestOTP(otp, phone);
		
		// Generate the JWT
		const signature = await GenerateSignature({
			_id: result._id,
			email: result.email,
			verified: result.verified
		});

		// Send the result to client
		return res.status(201).json({ success: true, message: { signature, verified: result.verified, email: result.email }});
	}

	return res.status(401).json({ success: false, message: "Failed to signup user." });
}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

	const loginInputs = plainToClass( UserLoginInputs, req.body );
	const loginErrors = await validate(loginInputs, { validationError: { target: false }});

	if (loginErrors.length > 0) {

		return res.status(401).json(loginErrors);
	}

	const { email, password } = loginInputs;
	const customer = await Customer.findOne({ email });

	if(customer) {
		
		const isValidPassword = await validatePassword(password, customer.password);
		
		if(isValidPassword) {

			const signature = await GenerateSignature({
				_id: customer._id,
				email: customer.email,
				verified: customer.verified
			});

			return res.status(201).json({ success: true, message: { signature, verified: customer.verified, email: customer.email }});
		}
	}

	return res.status(401).json({ success: false, message: "Failed to login user." });

}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

	const { otp } = req.body;

	const user = req.user;

	if(user) {
		const profile = await Customer.findById(user._id);

		if(profile) {
			if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
				
				profile.verified = true;

				const updateProfile = await profile.save();

				const signature = await GenerateSignature({
					_id: updateProfile._id,
					email: updateProfile.email,
					verified: updateProfile.verified
				});

				return res.status(201).json({ success: true, message: { signature, verified: updateProfile.verified, email: updateProfile.email }});
			}
		}
	}

	return res.status(401).json({ success: false, message: "Failed to verify user." });
}


export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if(customer) {
		
		const customerProfile = await Customer.findById(customer._id);

		if(customerProfile) {
			
			const { otp, expiry } = GenerateOtp();
			customerProfile.otp = otp;
			customerProfile.otp_expiry = expiry;

			await customerProfile.save();
			await onRequestOTP(otp, customerProfile.phone);

			return res.status(201).json({ success: true, message: "Your OTP has been sent to your phone." });
		}
	}

	return res.status(401).json({ success: false, message: "Failed to request OTP." });

}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if (customer) {
				
		const customerProfile = await Customer.findById(customer._id);

		if(customerProfile) {

			return res.status(201).json({ success: true, message: customerProfile });
		}
	}

	return res.status(401).json({ success: false, message: "Failed to fetch customer profile." });
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

	const profileErrors = await validate(profileInputs, { validationError: { target: false }});

	if (profileErrors.length > 0) {

		return res.status(401).json(profileErrors);
	}

	const { firstName, lastName, address } = profileInputs;

	if (customer) {
				
		const customerProfile = await Customer.findById(customer._id);

		if(customerProfile) {
			
			customerProfile.firstName = firstName;
			customerProfile.lastName = lastName;
			customerProfile.address = address;

			const result = await customerProfile.save();

			return res.status(201).json({ success: true, message: result });
		}
	}

	return res.status(401).json({ success: false, message: "Failed to edit customer profile." });

}