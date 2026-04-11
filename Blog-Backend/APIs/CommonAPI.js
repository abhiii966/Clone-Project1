import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { hash,compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middlewares/verifyToken.js'
import { config } from 'dotenv'
import {upload} from '../config/multer.js'
import {uploadToCloudinary} from '../config/cloudinaryUpload.js'
const {sign}=jwt
export const commonApp=exp.Router()

//route for register
commonApp.post("/users",upload.single("profileImageUrl"),async(req,res)=>{
    let allowedRoles=['USER','AUTHOR']
    //get user from body
    const newUser=req.body
    //check role
    if(!allowedRoles.includes(newUser.role)){
        return res.status(400).json({message:"Invalid User Role."})
    }

    // let cloudinaryResult;
    //upload image to cloudinary from memoryStorage
    // upload image to cloudinary if file exists
    if(req.file){
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer)
        newUser.profileImageUrl = cloudinaryResult.secure_url
    }

    //hash the password
    const hashedPassword=await hash(newUser.password,12)
    //replace plain password with hashed password
    newUser.password=hashedPassword
    //create newUserDocument 
    const newUserDocument=new UserModel(newUser)
    //save 
    const result=await newUserDocument.save()
    console.log(result)
    //response
    res.status(201).json({message:"Registration successful."})
})

commonApp.get("/users",verifyToken("admin"),async(req,res)=>{
    //get the data from db
    const userData=await UserModel.find()
    res.status(200).json({message:"User Data",payload:userData})
    })

//LOGIN
commonApp.post('/users/login',async(req,res)=>{
    //get data from req
    const {email,password}=req.body
    //check email if it exists
    let user = await UserModel.findOne({email:email})
    //if email isnt found
    if(!user){
        return res.status(400).json({message:"Invalid email."})
    }
    //if email is valid then validate the password.
    const passwordMatch = await compare(password,user.password)
    //if password doesnt match
    if(passwordMatch===false){
        return res.status(400).json({message:"Incorrect Password."})
    }

    //if the user is blocked from app-side(admin)
    if(!user.isUserActive){
    return res.status(403).json({message:"Your account has been blocked. Please contact the admin."})
    }

    //if password matches,give a token
    const signedToken=sign(
        {
        _id:user.id,
        email:user.email,
        role:user.role,
        firstName:user.firstName,
        profileImageUrl:user.profileImageUrl,
        lastName:user.lastName,
    },process.env.SECRET_KEY,{expiresIn:"1hr"})
    //store it as httpOnly token
    res.cookie("token",signedToken,{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })
    let userObj=user.toObject()
    delete userObj.password
    res.status(200).json({message:"Login Success",payload:userObj})
})


//logout  route
commonApp.get("/users/logout",(req,res)=>{
    //delete token from the cookie storage
    res.clearCookie("token",{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })
    res.status(200).json({message:"Logout Success."})
})

//Page refresh
commonApp.get("/check-auth",verifyToken("USER","AUTHOR","ADMIN"),(req,res)=>{
    res.status(200).json({
        message:"authenticated",
        payload:req.user
    })
})

//Change password
commonApp.put("/users/password",verifyToken("user","admin","author"),async(req,res)=>{
    //check the current password and new password are same
    const {currentPassword,newPassword}=req.body
    console.log(currentPassword)
    //get the userId
    const userId=req.user?._id
    //get current password of user
    const user=await UserModel.findById(userId)
    //check the current password of req and user are not same
    const passwordMatch = await compare(currentPassword,user.password)
    //if password doesnt match
    if(!passwordMatch){
        return res.status(401).json({message:"Enter correct password to change password."})
    }
    //hash the password
    const sameValidation=await compare(newPassword,user.password)
    //if current and new passwords are same
    if(sameValidation===true){
        return res.status(400).json({message:"Current and new passwords cannot be same."})
    }
    const hashedPassword=await hash(newPassword,12)
    //replace current pass w hashed new password
    const result = await UserModel.findByIdAndUpdate(
        userId,
        {$set:{password:hashedPassword}}
        )
    //res
    res.status(200).json({message:"Password changed successfully."})
    })