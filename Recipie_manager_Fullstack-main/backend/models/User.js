const mongoose=require('mongoose')
const Userschema=mongoose.Schema({
    username:{type:String, require:true},
    email:{type:String, require:true},
    password:{type:String, require:true}
})

module.exports=mongoose.model('User',Userschema)