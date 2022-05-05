import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSignature, onRequestOTP } from "../utilities";
import { Customer } from "../models/Customer";

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

	const customerInputs = plainToClass(CreateCustomerInputs, req.body);
	const inputErrors = await validate(customerInputs, { validationError: { target: true }});

	if(inputErrors.length > 0) {
		return res.status(400).json(inputErrors);
	}

	const { email, phone, password } = customerInputs;

	// const isCustomerExisting = await FindCustomer('', email);
	
	// if (isCustomerExisting !== null) {
	// 	return res.status(400).json({ message: "Customer exists already."});
	// }

	const userPassword = await GeneratePassword(password);
	
	const {otp, expiry } = GenerateOtp();

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
}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

}


export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {

}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

}