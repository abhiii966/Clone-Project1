import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { ArticleModel } from '../models/ArticleModel.js'
export const adminApp=exp.Router()


//read all users
adminApp.get('/users/user',verifyToken("ADMIN"),async(req,res)=>{
    //get all the available files
    const users=await UserModel.find({role:{$eq:"USER"}},{firstName:1,lastName:1,email:1,isUserActive:1})
    //send res 
    res.status(200).json({message:"Users",payload:users})
})

//read authors
adminApp.get('/users/author',verifyToken("ADMIN"),async(req,res)=>{
    //get all the available files
    const users=await UserModel.find({role:{$eq:"AUTHOR"}},{firstName:1,lastName:1,email:1,isUserActive:1})
    //send res 
    res.status(200).json({message:"Authors",payload:users})
})

//read all the articles
adminApp.get('/articles/article',verifyToken("ADMIN"),async(req,res)=>{
    //get all the articles from db
    const articles=await ArticleModel.find({},{author:1,title:1,category:1,content:1,comments:1,isArticleActive:1})
    // console.log(articles)
    //send res
    res.status(200).json({message:"Articles",payload:articles})
})

//block or activate user
adminApp.patch("/users",verifyToken("ADMIN"),async(req,res)=>{
    //get req body
    const {userId,isUserActive}=req.body
    //check if the user is available
    const user= await UserModel.findOne({_id:userId})
    //if user not available
    if(!user){
        return res.status(404).json({message:"User not found."})
    }
    //if the status is same
    if(user.isUserActive===isUserActive){
        return res.status(400).json({message:"No change in status."})
    }
    //status updation
    const result= await UserModel.findByIdAndUpdate({_id:userId},{$set:{isUserActive:isUserActive}},{new:true})
    //res
    res.status(201).json({message:"Status Updated."})
})



//block or activate author
adminApp.patch("/articles",verifyToken("ADMIN"),async(req,res)=>{
    //get req body
    const {articleId,isArticleActive}=req.body
    //check if the user is available
    const article= await ArticleModel.findOne({_id:articleId})
    //if user not available
    if(!article){
        return res.status(404).json({message:"Article not found."})
    }
    //if the status is same
    if(article.isArticleActive===isArticleActive){
        return res.status(400).json({message:"No change in status."})
    }
    //status updation
    const result= await ArticleModel.findByIdAndUpdate({_id:articleId},{$set:{isArticleActive:isArticleActive}},{new:true})
    //res
    res.status(201).json({message:"Status Updated."})
})