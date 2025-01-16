import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
import express from "express";

dotenv.config({
    path: './dev'
})


const app = express();

const mongoDBconnect = async()=>{
try{
   await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
}
catch(err){
     console.error('Connection Error ',err.message);
}
}

export default mongoDBconnect;