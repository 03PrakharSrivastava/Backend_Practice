import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
videoFile:{
    type: String,
    required: true,
},

thumbnail:{
    type: String,
    required: true,
},
title:{
    type: String,
    required: true,
},
description:{
    type: String,
    required: true,
},
duration:{
    type: Number,
    required: true,
},
views:{
    type: Number,
    required: true,
},
owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
}
});

export const Video = mongoose.model('Video',videoSchema);