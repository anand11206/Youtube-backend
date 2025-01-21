import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploader } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async function(req,res){

    const {fullName,email,username,password} = req.body
    console.log(email, fullName);
    if ([fullName,email,username,password].some( (field) => field?.trim() === "" )){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username } , { email }]
    })
    if(existedUser){
        console.log(existedUser);
        throw new ApiError(409, "User already registered")
    }

    console.log(req);
    const avatarLocalPath = req.files?.avatar[0].path;
    
    let coverImageLocalPath;
    if(req.files && 
        Array.isArray(req.files.coverImage) && 
        req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }

    const avatar = await uploader(avatarLocalPath)
    const coverImage = await uploader(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Error while uploading Avatar")
    }
    
    const user = await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user");
    const deleteUser = async function(userId){
        if(User.findById(userId)){
            const deleteResponse = await User.findByIdAndDelete(userId)
        }
        else{
            throw new ApiError(400, "User not found!")
        }
    }
    deleteUser(user._id)
    res.status(201).json(
        new ApiResponse(200,createdUser , "User successfully registered")
    )
})

export {registerUser}