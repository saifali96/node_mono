import express, { Request, Response, NextFunction } from "express";
import { plainToClass, plainToInstance } from "class-transformer";
import { CreateCustomerInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSignature, isEmptyArray, onRequestOTP, validatePassword } from "../utilities";
import { Customer } from "../models/Customer";
import { Food } from "../models";
import { Order } from "../models/Order";

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
		lng: 0,
		orders: []

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

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

	// Get current logged in user
	const customer = req.user;

	if(customer) {
		
		// Create a new order ID
		const orderID = `${Math.floor(Math.random() * 89999) + 1000}`;	// TODO - change to UUID?

		const profile = await Customer.findById(customer._id);

		const cartInputs = plainToInstance(OrderInputs, <[OrderInputs]>req.body);
		let errArr = Array();

		for (const input of cartInputs) {
			errArr.push(await validate(plainToClass(OrderInputs, input), { validationError: { target: false }}));
		}

		if (!isEmptyArray(errArr)) {

			return res.status(401).json(errArr);
		}

		//  Grab order items from request
		const cart = <[OrderInputs]>req.body;
		let cartItems = Array();
		let netAmount = 0.0;

		// Calculate order amount
		const foods = await Food.find().where("_id").in(cart.map(item => item._id)).exec();

		foods.map(food => {

			cart.map(({ _id, unit }) => {

				if(food._id == _id) {
					netAmount += (food.price * unit);
					cartItems.push({ food, unit });
				}
			});
		});

		// Create order with item descriptions
		if(cartItems) {

			// Create Order
			const currentOrder = await Order.create({
				orderID,
				items: cartItems,
				totalAmount: netAmount,
				orderDate: new Date(),
				paidVia: "CoD",
				paymentResponse: '',
				orderStatus: "PENDING"
			});

			if(currentOrder) {
				
				// Finally update orders in user account
				profile?.orders.push(currentOrder);
				await profile?.save();

				return res.status(201).json({ success: true, message: currentOrder });
			}

		}		
	}

	return res.status(401).json({ success: false, message: "Failed to create order." });

}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

}

