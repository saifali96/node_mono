import mongoose, { Schema, Document } from "mongoose";

export interface OfferDoc extends Document {
	 
	offerType: string;		// VENDOR - GENERIC
	vendors: [any];			// [ "vendorID", "vendorID" ]
	title: string;			// EUR 10 off on weekdays
	description: string;	// Description with T&C
	minValue: number;		// Minimum order value should be EUR 15
	maxValue: number;		// Maximum order value should be EUR 100
	offerAmount: number;	// 10
	validFrom: Date;
	validUntil: Date;
	promoCode: string;		// WEEK10OFF
	promoType: string;		// USER - ALL - BANK - CARD
	bank: [any];
	bins: [any];
	zipCode: string;
	isActive: boolean;
	maxUse: number;			// How many times the offer can be redeemed;

}

const OfferSchema = new Schema({

	offerType: { type: String, required: true },
	vendors: [
		{
			type: Schema.Types.ObjectId,
			ref: "vendor"
		}
	],
	title: { type: String, required: true },
	description: String,
	minValue: { type: Number, required: true },
	maxValue: { type: Number, required: true },
	offerAmount: { type: Number, required: true },
	validFrom: Date,
	validUntil: Date,
	promoCode: { type: String, required: true },
	promoType: { type: String, required: true },
	bank: [
		{
			type: String
		}	
	],
	bins: [
		{
			type: Number
		}
	],
	zipCode: { type: Number, required: true },
	isActive: Boolean,
	maxUse: { type: Number, required: true }

}, {
	toJSON: {
		transform(doc, ret){
			delete ret.__v;
		}
	},
	timestamps: true
});

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };