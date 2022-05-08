import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDoc extends Document {
	
	customer: string;
	vendorID: string;
	orderID: string;
	originalValue: number;
	orderValue: number;
	offerUsed: string;
	status: string;
	paymentVia: string;
	paymentResponse: string;
	items: [any];		// [{ food, unit: 1 }]

}

const TransactionSchema = new Schema({

	customer: String,
	vendorID: String,
	orderID: { type: Schema.Types.ObjectId, ref: "order" },
	originalValue: Number,
	orderValue: Number,
	offerUsed: String,
	status: String,
	paymentVia: String,
	paymentResponse: String,
	items: [
		{
			food: { type: Schema.Types.ObjectId, ref: "food" },
			unit: { type: Number}
		}
	]
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

const Transaction = mongoose.model<TransactionDoc>("transaction", TransactionSchema);

export { Transaction };