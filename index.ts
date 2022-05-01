import express from "express";
import mongoose from "mongoose";

import { AdminRoute, VendorRoute } from "./routes";
import { MONGO_URI } from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/admin", AdminRoute);
app.use("/vendor", VendorRoute);

const dbReconnectTimeout = 5000; // ms.

function MongoDBConnect() {
  mongoose.connect(MONGO_URI)
    .catch(() => {}); // Catch the warning, no further treatment is required
                      // because the Connection events are already doing this
                      // for us.
}

const db = mongoose.connection;

db.on('connecting', () => {
  console.info('Connecting to MongoDB...');
});

db.on('error', (error) => {
  console.error(`MongoDB connection error: ${error}`);
  mongoose.disconnect();
});

db.on('connected', () => {
  console.info('Connected to MongoDB!');
});

db.once('open', () => {
  console.info('MongoDB connection opened!');
});

db.on('reconnected', () => {
  console.info('MongoDB reconnected!');
});

db.on('disconnected', () => {
  console.error(`MongoDB disconnected! Reconnecting in ${dbReconnectTimeout / 1000}s...`);
  setTimeout(() => MongoDBConnect(), dbReconnectTimeout);
});

MongoDBConnect();

app.listen(8000, () => {
	
	console.clear();
	console.log("Listening at 8000");
});