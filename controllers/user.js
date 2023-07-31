import { asyncError } from "../middleware/errorMiddleware.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { sendEmail } from "../middleware/sendEmail.js";
import crypto from "crypto";


export const registerUser = asyncError(async(req,res)=>{
    
  const {name, email,password} = req.body;
  let user = await User.findOne({email});

  if(user) 
  return res.
  status(400)
  .json({sucess:false, message:"User Already exists"});

user = await User.create({
name,
email, 
password, 
avatar:{public_id:"sample_id", url:"sampleurl"
}});


// for registering and logging at same time

const token = await user.generateToken();
const options = {
expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
httpOnly: true,
};

res.status(201).cookie("token", token, options).json({
  sucess:true,
  user,
  token,
});

 
}
);

// login the user
export const loginUser =    asyncError(async(req,res) =>{
  const { email, password } = req.body;

 const user = await User.findOne({ email }).select("+password");

    if(!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }
    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });

});

// logout the user
export const logoutUser = asyncError(async(req,res,next)=>{

const options = {
  expires: new Date(Date.now()), 
  httpOnly:true,
};
res.status(200).cookie("token",null,options)
.json({
  sucsess:true,
  message:"Logged Out Successfully..."
})
});


// password updating
export const updatePassword = asyncError(async(req,res,next)=>{
const user = await User.findById(req.user._id).select("+password");

const {oldPassword, newPassword} = req.body;
if(!oldPassword || !newPassword){
  return res.status(400).json({
    success:false,
    message:"Please Provide old and new Password"
  }); 
}

const isMatch = await user.matchPassword(oldPassword);
if(!isMatch){
  return res.status(400).json({
    success:false,
    message:"Incorrect Old Password"
  });
};

user.password = newPassword;
await user.save();

return res.status(200).json({
  success:true,
  message:"Password Updated Successfully.."
});
});

// updating the profile

export const updateProfile = asyncError(async(req,res,next)=>{
  const user = await User.findById(req.user._id);
  const {name,email} = req.body;

  if(name){
    user.name = name;
  }
  if(email){
    user.email = email
  }

  // user Avatar to updated later on..

  await user.save();
  return res.status(200).json({
    success:true,
    message:"Profile Updated Successfully.."
  });
});

// delete the profile of user

export const deleteMyProfile = asyncError(async(req,res,next)=>{

  const user = await User.findById(req.user._id);
  const posts = user.posts;
  const followers = user.followers;
  const following = user.following;

  await user.deleteOne();
  const userId = user._id;

  // logout the user after deleting the profile..
  const options = {
    expires: new Date(Date.now()), 
    httpOnly:true,
  };
  res.cookie("token",null,options);
  
  // deleting all the posts of the user
for (let index = 0; index < posts.length; index++) {
  const post = await Post.findById(posts[index]);
  await post.deleteOne();
  
}

// removing user from followers Following
for (let i = 0; i < followers.length; i++) {
  const follower = await User.findById(followers[i]);
  const index = follower.following.indexOf(userId);
  follower.following.splice(index,1);
   await follower.save();
  
}

// removing user from followings Followers
for (let i = 0; i < following.length; i++) {
  const follows = await User.findById(following[i]);
  const index = follows.followers.indexOf(userId);
  follows.followers.splice(index,1);
   await follows.save();
  
}


  return res.status(200).json({
    success:true,
    message:"User Deleted Successfully.."
  });
})


// show my profile

export const myProfile = asyncError(async(req,res,next)=>{
const user = await User.findById(req.user._id).populate("posts");
res.status(200).json({
  success:true,
  user,
});
});

// get user profile
export const getUserProfile = asyncError(async(req,res,next)=>{
  const user = await User.findById(req.params.id).populate("posts");
  if(!user){
    return res.status(404).json({
      sucess:false,
      message:"User Does not Found..."
  })
  }
  res.status(200).json({
    success:true,
    user,
  });
});


// get all users
export const getAllUsers = asyncError(async(req,res,next)=>{
  const users = await User.find({});
  res.status(200).json({
    success:true,
    users,
  });
})

// forgot the login password
export const forgotPassword = asyncError(async(req,res,next)=>{

const user = await User.findOne({email:req.body.email});
if(!user){
  return res.status(404).json({
    sucess:false,
    message:"User Does not Found..."
});
};

const resetPasswordToken = user.getResetPasswordToken();
await user.save();
const resetUrl = `${req.protocol}://${req.get(
  "host"
)}/password/reset/${resetPasswordToken}`;

const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl} \n\nIf you have not request it than please ignore it...`;
try {
  await sendEmail({
      email:user.email,
      subject:`Socialite Password Recovery`,
      message,

  });
  res.status(200).json({
      sucess:true,
      message: `Email sent to ${user.email} sucessfully`,
  })
  
} catch (error) {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(500).json({
    sucess:false,
    message:error.message,
});
};  
});

// reset password token

export const resetPassword = asyncError(async(req,res,next)=>{
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()},
  });
  if(!user){
    return res.status(401).json({
      sucess:false,
      message:"Token is Invalid or Expired.."
  });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    sucess:true,
    message: "Password Updated sucessfully",
})

});