import {AsyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });     
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
} 

const registerUser = AsyncHandler(async (req, res) => {
    const {fullName, email, userName, password} = req.body;

    // Validate required fields
    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Get the local path of uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload files to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(500, "Avatar file upload failed");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    );
});


const loginUser = AsyncHandler(async (req, res) =>{
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }
    const {userName, email, password} = req.body;
    if(!userName && !email){
        throw new ApiError(400, "Username or email is required");
    }
    const user = await User.findOne({
        $or: [{userName}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully")
    )
})

const logoutUser = AsyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"))
})
export {registerUser, loginUser, logoutUser};