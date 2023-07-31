import { asyncError, errorMiddleware } from "../middleware/errorMiddleware.js";
import { Post} from "../models/Post.js";
import { User } from "../models/User.js";

// creationg the new post

export const createPost =  asyncError( async(req,res) =>{
    
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner:req.user._id,
        };

        const post = await Post.create(newPostData);
        const user = await User.findById(req.user._id);

        user.posts.push(post._id)
        await user.save();

        res.status(201).json({
            sucess:true,
            message: "Post created",

           });
});

// deleting the post


export const deletePost = asyncError(async(req,res,next)=>{

    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({
            sucess:false,
            message:"Post Does not Found..."
        })
    };

    if(post.owner.toString() !== req.user._id.toString()){
        
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    await post.deleteOne();

    // deleting the post from the users
    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index,1);

    await user.save();

    res.status(200).json({
        sucess:true,
        message:"Post Deleted Successfully.."
    })

});

// like and unlike the post

export const likeAndUnlikePost = asyncError(async(req,res,next)=>{

const post = await Post.findById(req.params.id);
if(!post){
    return res.status(404).json({
        sucess:false,
        message:"Post Does not Found..."
    })
};
// unliking the post..
if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id);

    post.likes.splice(index, 1);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Unliked",
    });
} 

// liking the post..
else {
    post.likes.push(req.user._id);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Liked",
    });
}
});

// updating the caption of the post

export const updateCaption = asyncError(async(req,res,next)=>{
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({
            sucess:false,
            message:"Post Does not Found..."
        })
    };

    if(post.owner.toString()!== req.user._id.toString()){
        return res.status(401).json({
            sucess:false,
            message:"Unauthorised.."
        })
    }
    post.caption=req.body.caption;
    await post.save();
    res.status(200).json({
        success: true,
        message: "Post Updated Successfully..",
      });
});


// adding the new comment to a post

export const addCommentPost = asyncError(async(req,res,next)=>{

    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({
            sucess:false,
            message:"Post Does not Found..."
        })
    };

    let commentIndex = -1;
// checking if the comment already exists..
    post.comments.forEach((item,index)=>{
        if(item.user.toString() === req.user._id.toString()){
            commentIndex = index;
        };
    });

    if(commentIndex !==-1){
        post.comments[commentIndex].comment = req.body.comment;
        await post.save();
        return res.status(200).json({
            sucess:true,
            message:"Comment Updated Successfully..."
        });

    }else{
    post.comments.push({
        user:req.user._id,
        comment:req.body.comment,
    });
    await post.save();
    return res.status(200).json({
        sucess:true,
        message:"Comment Added Successfully.."
    });
}     
});


// delete comment of a post..
export const deleteComment = asyncError(async(req,res,next)=>{
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({
            sucess:false,
            message:"Post Does not Found..."
        })
    };

    // if owner wants to delete any comment on its post
    if (post.owner.toString() === req.user._id.toString()) {
            if (req.body.commentId === undefined) {
              return res.status(400).json({
                success: false,
                message: "Comment Id is required",
              });
            }
              post.comments.forEach((item, index) => {
              if (item._id.toString() === req.body.commentId.toString()) {
                return post.comments.splice(index, 1);
              }
            });     
            await post.save();     
            return res.status(200).json({
              success: true,
              message: "Selected Comment has deleted",
            });
        
    } else { 
        // user delete its own comment on others post..
        post.comments.forEach((item,index)=>{
            if(item.user.toString() === req.user._id.toString()){
            return  post.comments.splice(index,1);
            };
        });
        await post.save();
        res.status(200).json({
            sucess:true,
            message:"Your Comment Deleted Successfully.."
        });
    }
});