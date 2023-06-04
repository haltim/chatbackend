const mongoose = require("mongoose")
require('dotenv').config()


const InitiateMongoServer = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true
        });
        console.log("connected to db")
    }
    catch(e){
        console.log(e)
        throw e
    }
}

module.exports = InitiateMongoServer