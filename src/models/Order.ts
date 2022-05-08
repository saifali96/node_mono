import mongoose, { Schema, Document } from "mongoose";

export interface OrderDoc extends Document {
	
	orderID: string;
	orderedBy: string;
	orderedFrom: string;
	items: [any];		// [{ food, unit: 1 }]
	totalAmount: number;
	orderDate: Date;
	paidVia: string;	// CoD, CC, Wallet
	paymentResponse: string; // { status: true, response: "Response string" }
	orderStatus: string;
	remarks: string;
	deliveryID: string;
	appliedOffers: boolean;
	offerID: string;
	readyTime: number;

}

const OrderSchema = new Schema({

	orderID: { type: String, required: true },
	orderedBy: { type: Schema.Types.ObjectId, ref: "customer", required: true },
	orderedFrom: { type: Schema.Types.ObjectId, ref: "vendor", required: true },
	items: [
		{
			food: { type: Schema.Types.ObjectId, ref: "food", required: true },
			unit: { type: Number, required: true }
		}
	],
	totalAmount: { type: Number, required: true },
	orderDate: { type: Date },
	paidVia: { type: String},
	paymentResponse: { type: String},
	orderStatus: { type: String},
	remarks: { type: String},
	deliveryID: { type: String},
	appliedOffers: { type: Boolean},
	offerID: { type: String},
	readyTime: { type: Number}
}, {
	toJSON: {
		transform(doc, ret){
			delete ret.__v;
			delete ret.createdAt;
			delete ret.updatedAt;
		}
	},
	timestamps: true
});

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };