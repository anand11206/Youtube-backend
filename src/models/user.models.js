import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required : true,
            unique :true
        },
        email:{
            type: String,
            required : true,
            unique :true
        },
        fullName:{
            type: String,
            required : true
        },
        avatar:{
            type: String,
            required : true
        },
        coverImage:{
            type: String
        },
        password:{
            type: String,
            required : [true,"Password is required"]
        },
        refreshToken:{
            type: String,
            unique :true
        },
        watchHistory:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    },
    {
        timestamps:true
    }
)

// encryption of password 
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    return next()
})
userSchema.method.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}
userSchema.method.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            username:this.username,
            email:this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiry:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.method.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            username:this.username,
            email:this.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiry:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema)