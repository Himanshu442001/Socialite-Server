import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { followUser, getPostOffFollowing } from "../controllers/follow.js";

const Router = express.Router();

Router.get( "/follow/:id",isAuthenticated,followUser);
Router.get( "/posts",isAuthenticated,getPostOffFollowing);


export default Router;   