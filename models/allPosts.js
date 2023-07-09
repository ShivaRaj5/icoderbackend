const mongoose=require('mongoose');
const allPostsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
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
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    
})
const allPostsModel=mongoose.model("allPosts",allPostsSchema);
module.exports=allPostsModel;