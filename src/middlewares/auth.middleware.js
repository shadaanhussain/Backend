import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = AsyncHandler(async (req, _, next) =>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!token){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid access token");
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Access token expired");
        } else {
            throw new ApiError(401, "Invalid access token");
        }
    }
})