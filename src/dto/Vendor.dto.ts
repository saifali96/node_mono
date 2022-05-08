export interface CreateVendorInput {
	name: string;
	ownerName: string;
	foodType: [string];
	zipcode: string;
	address: string;
	phone: string;
	email: string;
	password: string
}

export interface EditVendorInputs {
	name: string;
	address: string;
	phone: string;
	foodType: [string];
}

export interface VendorLoginInputs {
	email: string;
	password: string;
}

export interface VendorJWTPayload {
	_id: string;
	email: string;
	name: string;
}

export interface CreateOfferInputs {

	offerType: string;		// VENDOR - GENERIC
	vendors: [any];			// [ "vendorID", "vendorID" ]
	title: string;			// EUR 10 off on weekdays
	description: string;	// Description with T&C
	minValue: number;		// Minimum order value should be EUR 15
	maxValue: number;		// Maximum order value should be EUR 15
	offerAmount: number;	// 10
	validFrom: Date;
	validUntil: Date;
	promoCode: string;		// WEEK10OFF
	promoType: string;		// USER - ALL - BANK - CARD
	bank: [any];
	bins: [any];
	zipCode: string;
	isActive: boolean;
	maxUse: number;
}