import express, { Request, Response, NextFunction } from "express";
import { AddFood, AddOffer, EditOffer, GetCurrentOrders, GetFoods, GetOffers, GetOrderDetails, GetVendorProfile, ProcessOrder, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const imageStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "images");
	},
	filename: function(req, file, cb) {
		cb(null, `${uuidv4()}_${file.originalname}`);	// TODO : Remove original filename?
	}
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Vendor."});
});

router.post("/login", VendorLogin);

// Below are only authenticated routes
router.use(Authenticate)
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/profile/coverimage", images, UpdateVendorCoverImage);
router.patch("/service", UpdateVendorService);

router.post("/food", images, AddFood);
router.get("/food", GetFoods);

router.get("/orders", GetCurrentOrders);
router.put("/orders/:id/process", ProcessOrder);
router.get("/orders/:id", GetOrderDetails);

// Offers
router.get("/offers", GetOffers);
router.post("/offers", AddOffer);
router.put("/offers/:id", EditOffer);
// delete offers

export { router as VendorRoute };