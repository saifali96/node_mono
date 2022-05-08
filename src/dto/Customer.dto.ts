import { IsArray, IsEmail, IsInt, Length, Max, Min, ValidateNested } from "class-validator";

export class CreateCustomerInputs {

	@IsEmail()
	email: string;
	
	@Length(7, 14)
	phone: string;

	@Length(6, 16)
	password: string;
}

export class UserLoginInputs {

	@IsEmail()
	email: string;

	@Length(6, 16)
	password: string;
	
}

export class EditCustomerProfileInputs {
	
	@Length(3, 16)
	firstName: string;
	
	@Length(3, 16)
	lastName: string;
	
	@Length(6, 16)
	address: string;

}

export interface CustomerPayload {

	_id: string;
	email: string;
	verified: boolean;
}

export class CartItem {
	
	@Length(24)
	_id: string;

	@IsInt()
  	@Min(1)
	@Max(10)
	unit: number;
}

export class OrderInputs {
	
	transactionID: string;
	items: [CartItem];
}