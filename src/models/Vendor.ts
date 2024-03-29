import mongoose, { Schema, Document } from "mongoose";

interface VendorDoc extends Document {

	name: string;
	ownerName: string;
	foodType: [string];
	zipcode: string;
	address: string;
	phone: string;
	email: string;
	password: string;
	serviceAvailability: boolean;
	coverImages: [string];
	rating: number;
	foods: any;
	geoData: {
			lng: number
			lat: number
		};
}

const VendorSchema = new Schema({
	
	name: { type: String, required: true },
	ownerName: { type: String, required: true} ,
	foodType: { type: [String] },
	zipcode: { type: String, required: true },
	address: { type: String },
	phone: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	serviceAvailability: { type: Boolean },
	coverImages: { type: [String] },
	rating: { type: Number },
	foods: [{
		type: mongoose.SchemaTypes.ObjectId,
		ref: "food"
	}],
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

const Vendor = mongoose.model<VendorDoc>("vendor", VendorSchema);

export { Vendor };