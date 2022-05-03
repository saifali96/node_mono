import express, { Request, Response, NextFunction } from "express";
import { AddFood, GetFoods, GetVendorProfile, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from "../controllers";
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

router.post("/login", VendorLogin);

router.use(Authenticate)
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/profile/coverimage", images, UpdateVendorCoverImage);
router.patch("/service", UpdateVendorService);

router.post("/food", images, AddFood);
router.get("/food", GetFoods);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	
	return res.json({ message: "Hello from Vendor."});
});

export { router as VendorRoute };