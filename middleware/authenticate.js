const jwt=require('jsonwebtoken');
const UsersModel=require("../models/users")
const dotenv=require('dotenv');
dotenv.config({path:'../config.env'});
const Authenticate=async (req,res,next)=>{
    try{
        let token=req.cookies.jwtoken;
        // console.log(token);
        const verifyToken=jwt.verify(token,process.env.AUTH_KEY);
        // console.log(verifyToken)
        const rootUser=await UsersModel.findOne({_id:verifyToken._id,"tokens.token":token})
        if(!rootUser)
            throw new Error("User not found!")
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id; 
        next();
    }catch(err){
        res.status(401).send("Unauthorize Access");
    }
}
module.exports=Authenticate;