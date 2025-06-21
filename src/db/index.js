import mongoose from 'mongoose';
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        console.log(`Connecting to DB: ${process.env.MONGO_DB_URL}, DB Name: ${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`)

        console.log(`Connected to MongoDB at host: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error("MONGODB connection failed:", err.message);
        process.exit(1);
    }
};

export default connectDB;
