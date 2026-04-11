import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
export const userApp=exp.Router()

//read all the articles
userApp.get('/articles',verifyToken("USER","AUTHOR"),async(req,res)=>{
    //read articles
    const articlelist = await ArticleModel.find({isArticleActive:true})
    //send res
    res.status(200).json({message:"articles",payload:articlelist})

})

//Add a comment 
userApp.put("/articles",verifyToken("USER"),async(req,res)=>{
    //get body from request
    const {articleId, comment}=req.body
    //check article
    const articleDocument=await ArticleModel.findOne({_id:articleId,isArticleActive:true}).populate("comments.user","email")
    //if the article is not available
    if(!articleDocument){
        return res.status(404).json({message:"Article not found."})
    }
    //get user 
    const userId=req.user?._id
    //add comment
    articleDocument.comments.push({ user: userId, comment: comment })
    //save
    await articleDocument.save()
    //send res
    res.status(201).json({message:"Comment added successfully.",payload:articleDocument})
})

userApp.get('/article/:id', verifyToken("USER","AUTHOR"), async(req,res)=>{
    const article = await ArticleModel.findById(req.params.id)
        .populate("comments.user", "firstName email")
        .populate("author", "firstName")
    res.status(200).json({message:"article", payload:article})
})