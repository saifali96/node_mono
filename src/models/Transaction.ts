import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDoc extends Document {
	
	customer: string;
	vendorID: string;
	orderID: string;
	orderValue: number;
	offerUsed: string;
	status: string;
	paymentVia: string;
	paymentResponse: string;

}

const TransactionSchema = new Schema({

	customer: String,
	vendorID: String,
	orderID: String,
	orderValue: Number,
	offerUsed: String,
	status: String,
	paymentVia: String,
	paymentResponse: String,
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