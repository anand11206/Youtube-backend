import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploader } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        
        throw new ApiError(500, error?.message || "Something went wrong")
    }
}


const registerUser = asyncHandler(async function(req,res){

    const {fullName,email,username,password} = req.body
    

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
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
   
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
    // const deleteUser = async function(userId){
    //     if(User.findById(userId)){
    //         const deleteResponse = await User.findByIdAndDelete(userId)
    //     }
    //     else{
    //         throw new ApiError(400, "User not found!")
    //     }
    // }
    // deleteUser(user._id)
    res.status(201).json(
        new ApiResponse(200,createdUser , "User successfully registered")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body
    
    if(!username.trim() && !email.trim()){
        throw new ApiError(400, "One of username and email is required")
    }

    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json (
        new ApiResponse(200,
            {
                user : loggedInUser, 
                accessToken, 
                refreshToken
            },
            "User Logged In Successfully")
    )


})

const logoutUser = asyncHandler(async(req,res) => {
    
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    ).select("-password")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorised Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(!user){
        throw new ApiError(400, "Invalid Refresh Token")
    }
    
    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(400, "Refresh Token is expired or used")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken
            },
            "Access Token refreshed successfully"
        )
    )
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "All fields required")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(400, "Invalid Request")
    }
    if(!user.isPasswordCorrect(oldPassword)){
        throw new ApiError(400, "Wrong Old Password")
    }
    user.password = newPassword
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed"))

})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    if(!fullName.trim() && !email.trim()) {
        throw new ApiError(400, "Atleast one field required")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            fullName,
            email:email

        }
    },
    {
        new:true
    }).select("-password -refreshToken")
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Details changed Successfully"))
})

const updateAvatarAndCoverImage = asyncHandler(async(req, res) => {
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0].path
    const coverImageLocalPath = req.files?.coverImage?.[0].path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploader(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar")
    }
    let coverImage;
    try {
        
        if(coverImageLocalPath){
            coverImage = await uploader(coverImageLocalPath)
        }
    } catch (error) {
        throw new ApiError(400, error?.message || "cover Image Local Path not found")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url,
                coverImage:coverImage?.url || ""
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Files Uploaded"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params
    if(!username){
        throw new ApiError(400, "Username missing")
    }

    const channel = await User.aggregate(
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addField:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    cond:{
                        if:{$in:[req.user._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        }
    )
    if(!channel){
        throw new ApiError(400, "Channel does not exist")
    }
    console.log(channel);
    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel details found"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateAvatarAndCoverImage,
    getUserChannelProfile
}