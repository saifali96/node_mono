import mongoose, { Schema, Document } from "mongoose";

interface DeliverUserDoc extends Document {

	email: string;
	password: string;
	firstName: string;
	lastName: string;
	address: string;
	zipcode: string;
	phone: string;
	verified: boolean;
	orders: [any];
	isAvailable: boolean;
	geoData: {
		lng: number
		lat: number
	};

}

const DeliveryUserSchema = new Schema({
	
	email: { type: String, required: true },
	password: { type: String, required: true },
	firstName: { type: String },
	lastName: { type: String },
	address: { type: String },
	zipcode: { type: String },
	phone: { type: String, required: true },
	verified: { type: Boolean, required: true },
	isAvailable: { type: Boolean, required: true },
	orders: [
		{
			type: Schema.Types.ObjectId,
			ref: "order"
		}
	],
	geoData: {
		lng: { type: Number },
		lat: { type: Number }
	}
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

const DeliveryUser = mongoose.model<DeliverUserDoc>("delivery_user", DeliveryUserSchema);

export { DeliveryUser };