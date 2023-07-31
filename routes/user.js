import express from "express";
import {  deleteMyProfile, forgotPassword, getAllUsers, getUserProfile, loginUser,logoutUser,myProfile,registerUser, resetPassword, updatePassword, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";


const Router = express.Router();

Router.post( "/register",registerUser);

Router.post("/login",loginUser);
Router.get("/logout",logoutUser);

Router.put("/update/password", isAuthenticated,updatePassword);
Router.put( "/update/profile",isAuthenticated,updateProfile);

Router.delete( "/delete/me",isAuthenticated,deleteMyProfile);
Router.get( "/me",isAuthenticated,myProfile);
Router.get( "/user/:id",isAuthenticated,getUserProfile);
Router.get( "/users",isAuthenticated,getAllUsers);
Router.post( "/forgot/password",forgotPassword);

Router.put( "/password/reset/:token",resetPassword);















export default Router;   