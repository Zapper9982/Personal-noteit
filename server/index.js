require('dotenv').config();

const config = require('./config.json')
const mongoose = require('mongoose');


mongoose.connect(config.connectionString);

const User = require('./models/user.model');
const Notes = require('./models/notes.model');  
const express = require('express');
const cors = require('cors');   
const app = express();

const jwt = require('jsonwebtoken');
const {authenticateToken} = require('./utilities');
const {error} = require('console');



const port = process.env.PORT || 8000;


app.use(express.json());
app.use(cors({
    origin:"*"
})
);

app.get('/', (req, res) => {
    res.json({data:"hello"})});

//CREATE ACCOUNT
app.post('/create-account',async (req,res)=>{

    const {fullName,email,password}=req.body;

    if(!fullName){return res.status(400).json({error:true,message:"Full Name is required"});} 
    if(!email) {return res.status(400).json({error:true,message:"Email is required"});}
    if(!password) {return res.status(400).json({error:true,message:"Password is required"});}

    const isUser = await User.findOne( { email:email});
    if(isUser) {return res.status(400).json({error:true,message:"User already exists"});}


    const user = new User({
        fullName,
        email,
        password
    });
   await user.save();

   const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:"36000m"
   });
   return res.json({
    error:false,
    user,
    accessToken,
    message:"Account created successfully"
   })
})

//LOGIN ACCOUNT
app.post('/login',async(req,res)=>{
    const {email,password}= req.body 
    if(!email) {return res.status(400).json({error:true,message:"Email is required"});}
    if(!password) {return res.status(400).json({error:true,message:"Password is required"});}

    const Userinfo = await User.findOne({email:email});

    if(!Userinfo) { 
        return res.status(400).json({error:true,message:"User does not exist"});
    }

    if(Userinfo.email===email && Userinfo.password===password){
        const user= {user : Userinfo};
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"36000m"
        });
        return res.json({
            error:false,
            message:"Logged in Successfully",
            email,
            accessToken
        })
        } else{
            res.status(400).json({error:true,message:"Invalid Credentials"});
        }

   



})


//GET USER
app.get('/get-user',authenticateToken,async (req,res)=>{
    const {user} = req.user;
    const userInfo = await User.findOne({_id:user._id});
    if(!userInfo){return res.status(404).json({error:true,message:"User not found"});}
    return res.json({error:false,
        user:{fullName:userInfo.fullName , email:userInfo.email , "_id":userInfo._id , CreatedOn:userInfo.CreatedOn},message:"User fetched successfully"});
})

//ADD NOTE
app.post('/add-note',authenticateToken,async (req,res)=>{

    const {title,content,tags}= req.body;
    const {user}=req.user;

    if(!title){ return res.status(400).json({error:true,message:"Title is required"});}
    if(!content){ return res.status(400).json({error:true,message:"Content is required"});}

    try {
        const note = new Notes({
            title,
            content,
            tags:tags || [],
            userId:user._id
        });
       
        await note.save();
        return res.json({error:false,message:"Note added successfully"});
    } catch (error) {
        return res.status(500).json({error:true,message:"Something went wrong"});
    }
    

});


//EDIT NOTE
app.put('/edit-note/:noteId',authenticateToken,async (req,res)=>{

    const noteId = req.params.noteId;
    const {title,content,tags,isPinned} = req.body;
    const {user} = req.user;


    if(!title && !content && !tags){
        return res.status(400).json({error:true,message:"Nothing to update"});
    }

    try {
        const note =await Notes.findOne({_id:noteId,userId:user._id});

        if(!note){
            return res.status(404).json({error:true,message:"Note not found"});
        }

        if(title) note.title=title;
        if(content) note.content=content;
        if(tags) note.tags=tags;
        if(isPinned) note.isPinned=isPinned;

        await note.save();

        return res.json({error:false,note , message:"Note updated successfully"});
        
    } catch (error) {

        return res.status(500).json({error:true,message:"Something went wrong"});
        
    }
    
});

//GET ALL NOTES
app.get('/get-all-notes',authenticateToken,async (req,res)=>{
    const {user}= req.user;

    try {
        const notes = await Notes.find({userId:user._id}).sort({isPinned:-1});
        return res.json({error:false,notes,message:"Notes fetched successfully"});
    } catch (error) {
        return res.status(500).json({error:true,message:"Something went wrong"});
    }

})

//DELETE NOTE
app.delete('/delete-note/:noteId',authenticateToken,async (req,res)=>{
    const noteId = req.params.noteId;   
    const {user}=req.user;
    try {
        const note = await Notes.findOne({
            _id:noteId,
            userId:user._id
        });
        if(!note){
            return res.status(404).json({error:true,message:"Note not found"});
        }

        await note.deleteOne({ _id:noteId, userId:user._id});

        return res.json({error:false,message:"Note deleted successfully"});
       
    } catch (error) {
        return res.status(500).json({error:true,message:"Something went wrong"});
    }
})

//PIN NOTE
app.put('/pin-note/:noteId',authenticateToken,async (req,res)=>{
    const noteId = req.params.noteId;
    const {user} = req.user;

    try {
        const note = await Notes.findOne({_id:noteId,userId:user._id});
        if(!note){
            return res.status(404).json({error:true,message:"Note not found"});
        }

        note.isPinned = !note.isPinned;
        await note.save();

        return res.json({error:false,note,message:"Note pinned successfully"});
        
    } catch (error) {
        return res.status(500).json({error:true,message:"Something went wrong"});
    }
})

//SEARCH NOTES
app.get('/search-notes',authenticateToken,async (req,res)=>{
    const {user} = req.user;
    const {query} = req.query;

    if(!query){
        res.status(400).json({error:true,message:"Query is required"});
    }

    try {
        const MatchingNotes = await Notes.find({
            userId:user._id,
            $or:[
                {title:{$regex:new RegExp(query,'i')}},
                {content:{$regex:new RegExp(query,'i')}},
                
            ]
        });

        return res.json({error:false,notes:MatchingNotes,message:"Notes fetched successfully"});
        
    } catch (error) {
        res.status(500).json({error:true,message:"Something went wrong"});
        
    }
});



app.listen(port);


module.exports = app;