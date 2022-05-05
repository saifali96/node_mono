import { VendorJWTPayload } from "./Vendor.dto";
import { CustomerPayload } from "./Customer.dto"

export type AuthPayload = VendorJWTPayload | CustomerPayload;
