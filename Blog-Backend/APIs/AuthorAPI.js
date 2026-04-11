import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { ArticleModel  } from '../models/ArticleModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
export const authorApp=exp.Router()

//write article 
authorApp.post("/articles",verifyToken("AUTHOR"), async(req,res)=>{
    //get authorData from req
    const authorData=req.body
    //get decodedToken data
    const user=req.user
    //check if author is accessing or not
    const authorVerify=await UserModel.findById(authorData.author)
    if(!authorVerify){
        return res.status(404).json({message:"Author not found."})
    }
    if(authorVerify.email!==user.email){
        return res.status(403).json({message:"You are not authorized."})
    }
    let authorDocument= new ArticleModel(authorData)
    await authorDocument.save()
    return res.status(201).json({message:"Article uploaded successfully."})
})

//read own articles
authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    const authorIdOfToken=req.user?._id
    // console.log("Author from token:", authorIdOfToken)
    const articles=await ArticleModel.find({author:authorIdOfToken})
    res.status(200).json({message:"article details",payload:articles})
})

//update article
authorApp.put("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //get modified article
    const {articleId,title,category,content}=req.body
    ///get article id from decodedToken
    const authorIdOfToken=req.user?._id
    const newArticle=await ArticleModel.findOneAndUpdate(
        {_id:articleId,author:authorIdOfToken},
        {$set:{title,category,content}},
        {new:true})
        if(!newArticle){
        return res.status(403).json({message:"You're not authorized."})
        }
        res.status(200).json({message:"Article Modified.",payload:newArticle})
})

//patch
authorApp.patch("/articles",verifyToken("AUTHOR"),async(req,res)=>{
//get author id from decoded token
const authortokenid =req.user?._id
//get modified article from client 
const {articleId,isArticleActive} = req.body
//get article by id
const articleofdb = await ArticleModel.findOne({_id:articleId,author:authortokenid})
// console.log(articleofdb)
//check status 
 if(isArticleActive === articleofdb.isArticleActive){
        return res.status(400).json({message:"No change in status"})
    }
    // update status
    const result = await ArticleModel.findByIdAndUpdate(
        articleId,
        {$set:{isArticleActive:isArticleActive}},
        {new:true}
    )
    res.status(200).json({message:"Article status updated", payload:result})
})

//to delete comment
authorApp.delete("/articles/:articleId/comments/:commentId", verifyToken("AUTHOR"), async(req,res)=>{
    const {articleId, commentId} = req.params
    const article = await ArticleModel.findByIdAndUpdate(
        articleId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
    ).populate("comments.user", "firstName email")
    
    res.status(200).json({message:"Comment deleted.", payload:article})
})