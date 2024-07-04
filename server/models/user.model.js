const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    CreatedOn:{
        type:Date,
        default:new Date().getTime()
    }


    
});


module.exports = mongoose.model('User',userSchema);
