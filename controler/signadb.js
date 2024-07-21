const mongoose = require('mongoose');
 mongoose.connect('mongodb://localhost:27017/realchat')
.then(()=>{
    console.log("mongodb connected");
})
.catch((err)=>{
    console.log("not connected mongodb ");
})




const loginschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneno:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

const details = new mongoose.model("persondetails",loginschema );
module.exports = details;
