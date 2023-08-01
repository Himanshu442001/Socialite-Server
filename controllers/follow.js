import { asyncError } from "../middleware/errorMiddleware.js";
import { User } from "../models/User.js";
import { Post} from "../models/Post.js";




// Follow  and Unfollow the user...

export const followUser = asyncError(async(req,res,next)=>{

    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if(loggedInUser.following.includes(userToFollow._id)){
      const indexFollowing  = loggedInUser.following.indexOf(userToFollow._id);
      const indexFollowers  = userToFollow.followers.indexOf(loggedInUser._id);
    
      loggedInUser.following.splice(indexFollowing, 1);
      userToFollow.followers.splice(indexFollowers, 1);
    
      await loggedInUser.save();
      await userToFollow.save();
    
      res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    }else{
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);
      
      await loggedInUser.save();
      await userToFollow.save();
      
      res.status(200).json({
        success: true,
        message: "User followed",
      });
    }   
});


export const getPostOffFollowing = asyncError(async(req,res,next)=>{


    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner:{
        $in:user.following,
      }
    }).populate("owner likes comments.user");
    res.status(200).json({
        success:true,
        posts:posts.reverse(),
     
     
    })




});