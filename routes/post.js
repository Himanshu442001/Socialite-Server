import express from "express";
import {  addCommentPost, createPost, deleteComment, deletePost, likeAndUnlikePost, updateCaption } from "../controllers/post.js";
import { isAuthenticated } from "../middleware/auth.js";


const Router = express.Router();

Router.post("/post/upload",isAuthenticated, createPost);
Router.get("/post/:id", isAuthenticated,likeAndUnlikePost);
Router.delete("/post/:id", isAuthenticated,deletePost);
Router.put("/post/:id", isAuthenticated,updateCaption);

Router.put("/post/comment/:id",isAuthenticated, addCommentPost);
Router.delete("/post/comment/:id",isAuthenticated, deleteComment);




export default Router;    