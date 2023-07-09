const express=require('express');
const mongoose=require('mongoose')
const app=express();
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const cors=require('cors')
const cookieParser = require('cookie-parser')
const dotenv=require('dotenv');
dotenv.config({path:'../config.env'});
app.use(express.json());
app.use(cookieParser())
app.use(cors());
const usersSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    age:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    messages:[
        {
            name:{
                type:String,
                required:true
            },
            email:{
                type:String,
                required:true
            },
            phone:{
                type:String,
                required:true
            },
            message:{
                type:String,
                required:true
            }
        }
    ],
    blogInfo:[
        {
            blogTitle:{
                type:String,
                required:true
            },
            blogDesc:{
                type:String,
                required:true
            },
            blogCat:{
                type:String,
                required:true
            },
            createdDate:{
                type:Date,
                default:Date.now
            }
        }
    ],
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    blogContent:[
        {
            content:{
                type:String,
                required:true
            }
        }
    ]
})

usersSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password=await bcrypt.hash(this.password,12);
        this.cpassword=await bcrypt.hash(this.cpassword,12);
    }
    next();
})
usersSchema.methods.generateAuthToken=async function(){
    try{
        let token=jwt.sign({_id:this._id},process.env.AUTH_KEY);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(err){
        return err;
    }
}
usersSchema.methods.addMessage=async function(name,email,phone,message){
    try{
        this.messages=this.messages.concat({name,email,phone,message});
        await this.save();
        return this.messages;
    }catch(err){
        return err;
    }
}
usersSchema.methods.addBlog=async function(email,name,blogTitle,blogDesc,blogCat){
    try{
        this.blogInfo=this.blogInfo.concat({email,name,blogTitle,blogDesc,blogCat});
        await this.save();
        return this.blogInfo;
    }catch(err){
        return err;
    }
}
usersSchema.methods.addContent=async function(email,name,content){
    try{
        this.blogContent=this.blogContent.concat({email,name,content});
        await this.save();
        return this.blogInfo;
    }catch(err){
        return err;
    }
}
const UsersModel=mongoose.model("UsersModel",usersSchema);
module.exports=UsersModel;