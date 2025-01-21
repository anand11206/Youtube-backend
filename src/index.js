import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});

connectDB()
.then(()=>{
    app.on('error',(err)=>{
        console.log("Connection Error: ",err);
    })
    app.listen(process.env.PORT)
})
.catch((e)=>{
    console.log("catched connection Error:",e);
})





















// import mongoose from "mongoose";
// import { DB_Name } from "./constants";

// ;(async () => {
//     try {   
//         var connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
//         console.log(connectionInstance);
//         console.log("port : ",process.env.PORT);
//     } catch (error) {
//         console.log("Error : ",error);
//         throw error // ends the program 
//     }
// })()