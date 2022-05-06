import express from "express";
import App from "./services/ExpressApp"
import Database from "./services/Database";
import { PORT } from "./config";

const startServer = async () => {
	
	const app = express();

	await Database();

	await App(app);

	app.listen(PORT, () => {

		console.log(`Listening on port ${PORT}.`);
	});
}

startServer();