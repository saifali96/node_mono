import express, { Request, Response, NextFunction } from "express";
import { plainToClass, plainToInstance } from "class-transformer";
import { CartItem, CreateCustomerInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSignature, isEmptyArray, onRequestOTP, validatePassword } from "../utilities";
import { Customer } from "../models/Customer";
import { DeliveryUser, Food, Offer, Transaction, Vendor } from "../models";
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
		geoData: {
			lng: 0,
			lat: 0
		},
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

	return res.status(400).json({ success: false, message: "Failed to signup user." });
}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

	const loginInputs = plainToClass( UserLoginInputs, req.body );
	const loginErrors = await validate(loginInputs, { validationError: { target: false }});

	if (loginErrors.length > 0) {

		return res.status(400).json(loginErrors);
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

			return res.status(200).json({ success: true, message: { signature, verified: customer.verified, email: customer.email }});
		}
	}

	return res.status(400).json({ success: false, message: "Failed to login user." });

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

				return res.status(200).json({ success: true, message: { signature, verified: updateProfile.verified, email: updateProfile.email }});
			}
		}
	}

	return res.status(400).json({ success: false, message: "Failed to verify user." });
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

			return res.status(200).json({ success: true, message: "Your OTP has been sent to your phone." });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to request OTP." });

}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if (customer) {
				
		const customerProfile = await Customer.findById(customer._id);

		if(customerProfile) {

			return res.status(200).json({ success: true, message: customerProfile });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to fetch customer profile." });
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

	const profileErrors = await validate(profileInputs, { validationError: { target: false }});

	if (profileErrors.length > 0) {

		return res.status(400).json(profileErrors);
	}

	const { firstName, lastName, address } = profileInputs;

	if (customer) {
				
		const customerProfile = await Customer.findById(customer._id);

		if(customerProfile) {
			
			customerProfile.firstName = firstName;
			customerProfile.lastName = lastName;
			customerProfile.address = address;

			const result = await customerProfile.save();

			return res.status(200).json({ success: true, message: result });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to edit customer profile." });

}

export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if(customer) {

		const profile = await Customer.findById(customer._id).populate("cart.food");
		let cartItems = Array();

		const { _id, unit } = <CartItem>req.body;
		const food = await Food.findById(_id);

		if(food && profile) {
			cartItems = profile.cart;

			if(cartItems.length > 0) {
				// check add update unit
				let existingFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);

				if(existingFoodItems.length > 0) {
					
					const index = cartItems.indexOf(existingFoodItems[0]);
					if(unit > 0) {
						cartItems[index] = { food, unit };
					} else {
						cartItems.splice(index, 1);
					}
				} else {
					cartItems.push({ food, unit });
				}
				
			} else {
				//  add new items to cart
				cartItems.push({ food, unit });
			}

			if(cartItems) {
				profile.cart = cartItems as any;
				const cartResult = await profile.save();

				if(cartResult) {
					return res.status(200).json({ success: true, message: cartResult.cart });
				}
			}
		}

	}
	return res.status(400).json({ success: false, message: "Failed to create a cart." });

}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if(customer) {
		
		const profile = await Customer.findById(customer._id).populate("cart.food");

		if(profile) {

			return res.status(200).json({ success: true, message: profile.cart });

		}
	}

	return res.status(400).json({ success: false, message: "Failed to get cart." });

}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if(customer) {

		const profile = await Customer.findById(customer._id).populate("cart.food");

		if(profile) {
			if(isEmptyArray(profile.cart)){
				return res.status(201).json({ success: true, message: profile });
			}
			profile.cart = [] as any;
			const cartResult = await profile.save();

			return res.status(200).json({ success: true, message: cartResult });

		}
	}

	return res.status(400).json({ success: false, message: "Failed to delete cart." });

}

const assignOrderForDelivery = async (orderID: string, vendorID: string) => {

	// Find vendor
	const vendor = await Vendor.findById(vendorID);

	if(vendor) {
		
		const areaCode = vendor.zipcode;
		const vendorLng = vendor.geoData.lng;
		const vendorLat = vendor.geoData.lat;
		
		// Find available delivery persons
		const deliveryPersons = await DeliveryUser.find({ zipcode: areaCode, verified: true, isAvailable: true });

		if(deliveryPersons) {
			// TODO - Find the nearest delivery person and assign the order
			const currentOrder = await Order.findById(orderID);
			
			if(currentOrder) {
				
				// update deliveryID
				currentOrder.deliveryID = deliveryPersons[0].id;
				deliveryPersons[0].orders.push(currentOrder.id);
				await deliveryPersons[0].save();
				await currentOrder.save();

				// TODO - Notify Vendor/User via push/sms/email?
			}
		}	
	}
}


export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

	const { paymentVia, offerID } = req.body;

	let errArr = Array();
	const items = <[CartItem]>req.body.items;
	for (const input of items) {
		errArr.push(await validate(plainToClass(CartItem, input), { validationError: { target: false }}));
	}

	if (!isEmptyArray(errArr)) {

		return res.status(400).json({ success: false, message: errArr });
	}
	
	let netAmount = 0.0;

	// Calculate order amount
	const foods = await Food.find().where("_id").in(items.map(item => item._id)).exec();

	foods.map(food => {

		items.map(({ _id, unit }) => {

			if(food._id == _id) {
				netAmount += (food.price * unit);
			}
		});
	});

	let payableAmount = Number();
	let appliedOffer;
	let remainingUses = 0;

	if(offerID) {

		appliedOffer = await Offer.findById(offerID);

		if(appliedOffer?.isActive) {
			remainingUses = appliedOffer.maxUse;
			if(remainingUses > 0) {
				payableAmount = (netAmount - appliedOffer.offerAmount);
			}
		}
	}

	// TODO - Perform Payment Gateway Charge API call

	// Record the transaction
	const transaction = await Transaction.create({
		
		customer: req.user?._id,
		vendorID: null,
		orderID: null,
		originalValue: netAmount,
		orderValue: payableAmount,
		offerUsed: offerID || null,
		status: "OPEN",		// FAILED - SUCCEEDED
		paymentVia,
		paymentResponse: "Payment is via Cash on Delivery.",
		items
	});

	//  Return the transaction ID
	if(transaction) {
		if(offerID && remainingUses > 0) {
			await Offer.updateOne({ _id: offerID }, { maxUse: remainingUses - 1, isActive: remainingUses === 1 ? false: true });
		}
		return res.status(200).json({ success: true, message: transaction });
	}

	return res.status(400).json({ success: false, message: "Failed to create payment." });
}

const validateTransaction = async (transactionID: string) => {

	const currentTransaction = await Transaction.findById(transactionID);
	if(currentTransaction && currentTransaction.status !== "FAILED" && currentTransaction.status !== "CONFIRMED"){
		return { status: true, currentTransaction };
	}
	
	return { status: false, currentTransaction }
}

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

	const orderObj = plainToInstance(OrderInputs, <OrderInputs>req.body);
	let errArr = Array();

	for (const input of orderObj.items) {
		errArr.push(await validate(plainToClass(CartItem, input), { validationError: { target: false }}));
	}

	if (!isEmptyArray(errArr)) {

		return res.status(400).json({ success: false, message: errArr });
	}

	// Get current logged in user
	const customer = req.user;
	const { transactionID, items } = orderObj;

	if(customer) {
		
		// Create a new order ID
		const orderID = `${Math.floor(Math.random() * 89999) + 1000}`;	// TODO - change to UUID?

		const profile = await Customer.findById(customer._id);
		const transactionObj = await validateTransaction(transactionID);

		if(!transactionObj.status){
			return res.status(400).json({ success: false, message: "Error while placing order. Transaction failed." });
		}

		if(profile && transactionObj.status && transactionObj.currentTransaction) {
	
			let cartItems = Array();
			let netAmount = 0.0;
			let vendorID = '';
			let readyTime = 0;
	
			// Calculate order amount
			const foods = await Food.find().where("_id").in(items.map(item => item._id)).exec();
	
			foods.map(food => {
	
				items.map(({ _id, unit }) => {
	
					if(food._id == _id) {
						readyTime += food.readyTime;
						vendorID = food.vendorID;
						netAmount += (food.price * unit);
						cartItems.push({ food, unit });
					}
				});
			});
	
			if(netAmount !== transactionObj.currentTransaction.originalValue) {
				return res.status(400).json({ success: false, message: "Failed to create order." });
			}

			// Create order with item descriptions
			if(cartItems) {
	
				// Create Order
				const currentOrder = await Order.create({
					orderID,
					orderedBy: customer._id,
					orderedFrom: vendorID,
					items: cartItems,
					orderDate: new Date(),
					totalAmount: netAmount,
					paidAmount: transactionObj.currentTransaction.orderValue,
					paidVia: "CoD",
					paymentResponse: '',
					orderStatus: "PENDING",
					remarks: '',
					deliveryID: '',
					appliedOffers: transactionObj.currentTransaction.offerUsed ? true : false,
					offerID: transactionObj.currentTransaction.offerUsed ? transactionObj.currentTransaction.offerUsed : null,
					readyTime: readyTime / cartItems.length
				});
	
				if(currentOrder) {
					
					// Finally update orders in user account
					profile.cart = [] as any;
					profile.orders.push(currentOrder);

					// Update transaction Object

					transactionObj.currentTransaction.vendorID = vendorID,
					transactionObj.currentTransaction.orderID = currentOrder.id,
					transactionObj.currentTransaction.status = "CONFIRMED",

					await profile.save();
					await transactionObj.currentTransaction.save();

					assignOrderForDelivery(currentOrder.id, vendorID);

					return res.status(201).json({ success: true, message: currentOrder });

				}
			}
		}		
	}

	return res.status(400).json({ success: false, message: "Failed to create order." });
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

	const customer = req.user;

	if(customer) {

		const profile = await Customer.findById(customer._id).populate("orders");

		if(profile) {
			return res.status(200).json({ success: true, message: profile.orders });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to get orders." });
}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

	const orderID = req.params.id;
	const customer = req.user;

	if(customer && orderID) {

		const order = await Order.findById(orderID).populate("items.food");

		if(order?.orderedBy == customer._id) {
			return res.status(200).json({ success: true, message: order });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to get order." });
}

export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

	const offerID = req.params.id;

	if(offerID) {

		const appliedOffer = await Offer.findById(offerID);

		if(appliedOffer?.isActive) {
			return res.status(200).json({ success: true, message: appliedOffer });
		}
	}

	return res.status(400).json({ success: false, message: "Failed to verify offer." });
}
