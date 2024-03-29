import { TWILIO_ACCT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } from "../config";

// Email

// Notifications

// OTP
export const GenerateOtp = () => {

	const otp = Math.floor(100000 + Math.random() * 900000);
	let expiry = new Date();
	expiry.setTime( new Date().getTime() + (30 * 60 * 1000) );

	return { otp, expiry }
}

export const onRequestOTP = async (otp: number, to: string) => {
	
	// const twilioClient = require("twilio")(TWILIO_ACCT_SID, TWILIO_AUTH_TOKEN);

	// const response = await twilioClient.messages.create({
	// 	body: `Your OTP is ${otp}`,
	// 	from: `${TWILIO_FROM_NUMBER}`,
	// 	to
	// });

	// return response;

	console.log(`Twilio message/OTO sent: ${otp}`);
	return true;
}

// Payment notifications or email