import {Schema,model} from "mongoose"

const userSchema=new Schema({
    firstName:{
        type:String,
        required:[true,"First name is required."],
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        required:[true,"email is required."],
        unique:[true,"email already exists."]

    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    role:{
        type:String,
        enum:["USER","AUTHOR","ADMIN"],
        required:[true,"Invalid role."]
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    }
},
{
    versionKey:false,
    timestamps:true,
    strict:"throw"
})

export const UserModel=model("user",userSchema)