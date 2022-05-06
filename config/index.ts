import 'dotenv/config';
export const MONGO_URI = process.env.MONGO_URI as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;

export const TWILIO_ACCT_SID = process.env.TWILIO_ACCT_SID as string;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;
export const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER as string;