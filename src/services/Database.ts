import mongoose from "mongoose";
import { MONGO_URI } from "../config";

const dbReconnectTimeout = 5000; // ms.

export default async () => {

	function MongoDBConnect() {
		mongoose.connect(MONGO_URI)
		  .catch(() => {}); // Catch the warning, no further treatment is required
							// because the Connection events are already doing this
							// for us.
	  }
	  
	  const db = mongoose.connection;
	  
	  console.clear();

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
}