import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
    try {   
                var connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
                console.log(connectionInstance.connection.host);
                console.log("port : ",process.env.PORT);
            } catch (error) {
                console.log("Error : ",error);
                throw error // ends the program 
            }
};

export default connectDB