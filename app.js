
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


const app = express();
export default app;

if(process.env.NODE_ENV !=="production"){
    dotenv.config({
        path:"config/config.env" 
    });
}


// using middlewares
app.use(express.json());

app.use(express.urlencoded({
    extended:true,
}));


app.use(cookieParser());




// Importing the different routes...

import postRoute from "./routes/post.js"
import userRoute from "./routes/user.js"
import followRoute from "./routes/follow.js"



// using the routes

app.use("/api/v1",postRoute);
app.use("/api/v1",userRoute);
app.use("/api/v1",followRoute);





