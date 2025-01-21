import express from "express"

const app = express()


app.use(express.json());
app.get('/',(req,res)=>{
    res.send('Hello');
})

// router import 
import userRouter from "./routes/user.route.js";

app.use("/api/v1/users",userRouter)


export {app}