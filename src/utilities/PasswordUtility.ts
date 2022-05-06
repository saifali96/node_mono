import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request } from "express";
import { JWT_SECRET } from "../config";
import { AuthPayload } from "../dto/Auth.dto";

const GenerateSalt = async () => {
	
	return await bcrypt.genSalt();
}

export const GeneratePassword = async (password: string) => {
	
	return await bcrypt.hash(password, await GenerateSalt());
}

export const validatePassword = async (givenPassword: string, savedPassword: string) => {

	return await bcrypt.compare(givenPassword, savedPassword);
}

export const GenerateSignature = async (payload: AuthPayload) => {;
	
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export const ValidateSignature = async (req: Request) => {
	
	const signature = req.get("Authorization");
	
	if (signature) {
	
		const payload = await jwt.verify(signature, JWT_SECRET) as AuthPayload;

		// TODO : Handle expired JWT tokens
		req.user = payload;
		return true
	}

	return false;
}