import mongoose, { Schema, Document } from "mongoose";
import { OrderDoc } from "./Order";

interface CustomerDoc extends Document {

	email: string;
	password: string;
	firstName: string;
	lastName: string;
	address: string;
	phone: string;
	verified: boolean;
	otp: number;
	otp_expiry: Date;
	geoData: {
		lng: number
		lat: number
	};
	orders: [OrderDoc];
	cart: [any]; 		// TODO - extract to a separate schema?

}

const CustomerSchema = new Schema({
	
	email: { type: String, required: true },
	password: { type: String, required: true },
	firstName: { type: String },
	lastName: { type: String },
	address: { type: String },
	phone: { type: String, required: true },
	verified: { type: Boolean, required: true },
	otp: { type: Number, required: true },
	otp_expiry: { type: Date, required: true },
	geoData: {
		lng: { type: Number },
		lat: { type: Number }
	},
	orders: [
		{
			type: Schema.Types.ObjectId,
			ref: "order"
		}
	],
	cart: [
		{
			food: { type: Schema.Types.ObjectId, ref: "food", required: true },
			unit: { type: Number, required: true }
		}
	]
}, {
	toJSON: {
		transform(doc, ret){
			delete ret.password;
			delete ret.__v;
			delete ret.createdAt;
			delete ret.updatedAt;
		}
	},
	timestamps: true
});

const Customer = mongoose.model<CustomerDoc>("customer", CustomerSchema);

export { Customer };