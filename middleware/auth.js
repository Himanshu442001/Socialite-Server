import {User} from "../models/User.js";
import jwt from "jsonwebtoken"


export const isAuthenticated = async(req,res,next) =>{

try {
    const  {token} = req.cookies;
   
    
    if(!token){
        return res.status(401).json({
            message:"please login first.."
        });
    }


    // checking the token  _id
const decoded = await jwt.verify(token, process.env.JWT_SECRET);

req.user = await User.findById(decoded._id);

next();
  
} 
   
catch (error) {
    res.status(500).json({ message:error.message});
  }
};