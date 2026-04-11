









6.
7. create common api for register,login and logout





// DRY Principle : Donot Repeat Yourself.



// if(!authorVerify.role==="AUTHOR"){
    //     return res.status(403).json({message:"Access to write article is denied."})
    // }





    
    // const user=req.user
    // //get the data from db
    // const articleData=await ArticleModel.findById(authorData.author)
    // res.status(200).json({message:"Article",payload:articleData.content})
    // 

Attacks:
  - xss attacks
  - csrf attacks