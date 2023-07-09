const express=require('express');
const mongoose=require('mongoose')
const app=express();
const bcrypt=require('bcryptjs');
const cors=require('cors')
const cookieParser = require('cookie-parser')
const dotenv=require('dotenv');
app.use(cors());
app.use(express.json());
app.use(cookieParser())
dotenv.config({path:'./config.env'});
const PORT=process.env.PORT || 5000;
const authenticate=require("./middleware/authenticate")
mongoose.connect(process.env.DATABASE)
.then(()=>{
    console.log("Connection Successfull")
}).catch((err)=>{
    console.log("No Connection")
    console.log(err);
})
const UsersModel=require("../server/models/users");
const allPostsModel=require("../server/models/allPosts");
// const lcsModel=require("../server/models/lcsModel");
// console.log(lcsModel)
app.post('/signup',async (req,res)=>{
    const {name,email,phone,age,gender,password,cpassword}=req.body;
    try{
        if(gender=='gender')
            return res.send("Please select a gender");
        const findUser=await UsersModel.findOne({email});
        if(findUser){
            return res.status(409).send("User Already Exist");
        }
        if(password!==cpassword)
            return res.status(406).send("Passwords do not match");
        const signupusers=new UsersModel({name,email,phone,age,gender,password,cpassword});
        const jsonData=await signupusers.save();
        // console.log(signupusers)
        if(jsonData)
            res.status(200).send("Data has been saved")
        else
            res.status(401).send("Data has not been saved for some reason");
    }catch(err){
        res.send(err);
        console.log(err);
    }
})
app.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const findUser=await UsersModel.findOne({email});
        if(findUser){
            const isMatch=await bcrypt.compare(password,findUser.password);
            const token=await findUser.generateAuthToken();
            // console.log(token)
            res.cookie("jwtoken",token,{
                expires:new Date(Date.now()+500000000),
                // httpOnly:true
            })
            
            if(isMatch)
                res.status(200).send("Login Successfully!")
            else
                res.status(401).send("Invalid Credentials!");
        } 
    }catch(err){
        res.send(err);
    }
})
app.post('/contact',async (req,res)=>{
    const {name,email,phone,message}=req.body;
    try{
        const findUser=await UsersModel.findOne({email});
        if(findUser){
            const saveMessages=await findUser.addMessage(name,email,phone,message);
            await findUser.save();
            // console.log(saveMessages);
            res.send("data has been saved")
        }
        else    
            res.send("Data has not been saved")
    }catch(err){
        res.send(err);
        console.log(err);
    }
})
app.post('/addBlog',async (req,res)=>{
    const {email,name,blogTitle,blogDesc,blogCat}=req.body;
    try{
        const findUser=await UsersModel.findOne({email,name});
        if(findUser){
            const saveMessages=await findUser.addBlog(email,name,blogTitle,blogDesc,blogCat);
            await findUser.save();
            // console.log(saveMessages);
            res.send("data has been saved")
        }
        else    
            res.send("Data has not been saved")
    }catch(err){
        res.send(err);
        console.log(err);
    }
})
app.post('/addBlogContent',async (req,res)=>{
    const {email,name,content}=req.body;
    try{
        const findUser=await UsersModel.findOne({email,name});
        if(findUser){
            const saveMessages=await findUser.addContent(email,name,content);
            await findUser.save();
            // console.log(saveMessages);
            res.send("data has been saved")
        }
        else    
            res.send("Data has not been saved")
    }catch(err){
        res.send(err);
        console.log(err);
    }
})
app.get('/blog',authenticate,(req,res)=>{
    res.send(req.rootUser);
})
app.get('/blog/createblog',authenticate,(req,res)=>{
    res.send(req.rootUser);
})
app.get("/fetchAllPosts",async (req,res)=>{
    try{
        const allUsers=await UsersModel.find({});
        res.send(allUsers)
    }catch(err){
        res.send(err);
    }
})
app.post("/postblog",async (req,res)=>{
    try{
        const {name,email,blogTitle,blogDesc,blogCat,content}=req.body;
        const savedData=new allPostsModel({name,email,blogTitle,blogDesc,blogCat,content});
        const saveData=await savedData.save();
        if(saveData)
            res.send("Data has been saved");
        else
            res.send("Data has not been saved for some reson")
    }catch(err){
        res.send(err);
    }
})
app.get("/getAllPosts",async (req,res)=>{
    try{
        const getPosts=await allPostsModel.find({});
        res.send(getPosts);
    }catch(err){
        res.send(err);
    }
})
app.get("/categories/:category",async (req,res)=>{
    try{
        const category=req.params.category;
        const getPosts=await allPostsModel.find({blogCat:category})
        res.send(getPosts)
    }catch(err){
        res.send(err);
    }
})
app.get("/categories/:category/:id",async (req,res)=>{
    try{
        const category=req.params.category;
        const _id=req.params.id;
        const getPosts=await allPostsModel.find({blogCat:category,_id:_id})
        res.send(getPosts[0])
    }catch(err){
        res.send(err);
    }
})
app.get('/logout',(req,res)=>{
    res.clearCookie("jwtoken",{path:'/'})
    res.status(200).send("Logged out successfully!");
})
app.get('/:email',async (req,res)=>{
    try{
        const email=req.params.email;
        const getPosts=await allPostsModel.find({email:email})
        res.send(getPosts)
    }catch(err){
        res.send(err);
    }
})
app.delete('/:id',async (req,res)=>{
    try{
        const _id=req.params.id;
        const getPosts=await allPostsModel.findByIdAndDelete(_id);
        res.send(getPosts)
    }catch(err){
        res.send(err);
    }
})
app.patch('/:id/updateblog',async (req,res)=>{
    try{
        const _id=req.params.id;
        const getPosts=await allPostsModel.findByIdAndUpdate(_id,req.body,{new:true});
        res.send(getPosts)
    }catch(err){
        res.send(err);
    }
})
app.get('/:id/getblog',async (req,res)=>{
    try{
        const _id=req.params.id;
        const getPosts=await allPostsModel.findOne({_id:_id});
        res.send(getPosts)
    }catch(err){
        res.send(err);
    }
})
app.listen(PORT,()=>{
    console.log("Listening to the port 5000")
})