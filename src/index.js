import dotenv from "dotenv";
import mongoose from 'mongoose';
import {DB_NAME} from "./constants.js";

import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
});
connectDB();
// import express from 'express';
// const app = express()
// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
//         app.on("error", (err) => {
//             console.error(err);
//             throw err;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`Server started on port ${process.env.PORT}`);
//         })
//     } catch (error){
//         console.error("Error: ",error);
//         throw error;
//     }
// })()