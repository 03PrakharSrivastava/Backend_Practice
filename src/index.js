import express from "express";
import mongoDBconnect from "./db";

const app = express();
  
mongoDBconnect();

app.listen(process.env.PORT,()=>{
  console.log(`Listening at port ${process.env.PORT}`);
})