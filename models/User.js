import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const schema = new mongoose.Schema({

name : {
    type:String,
    required: [true, "Please Enter A Name"],

},

avatar:{
    public_id:String,
    url:String,
},
email:{
    type:String,
    required: [true, "Please Enter A Email"],
    unique:[true, "Email already exits"]
},
password:{
    type:String,
    required: [true, "Please Enter Password"],
    minLength:[6, "Password must be atleast 6 characters"], 
    select:false,

},

posts:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
    }
],
followers:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",

}
],

following:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",

}
],
resetPasswordToken:String,
resetPasswordExpire:Date,
});

schema.pre("save", async function(next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);

    }
    next();
});


schema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password);
}


schema.methods.generateToken = function(){
return jwt.sign({_id: this._id}, process.env.JWT_SECRET);
}

schema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}



export const User = mongoose.model("User", schema);