import { IsEmail, isEmpty, IsEmpty, Length } from "class-validator";

export class CreateCustomerInputs {

	@IsEmail()
	email: string;
	
	@Length(7,14)
	phone: string;

	@Length(6, 16)
	password: string;
}

export interface CustomerPayload {
	_id: string;
	email: string;
	verified: boolean;
}