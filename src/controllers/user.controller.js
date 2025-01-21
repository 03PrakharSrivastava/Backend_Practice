import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import uploadCloudinary from '../utils/cloudinary.js'
import apiResponse from '../utils/apiResponse.js';

const registerUser = asyncHandler(async(res,res)=>{
  const {username,email,fullname,password} = res.body;

  if([fullname,email,password,username].some((field)=> field==="")){
    throw new ApiError(400,"Enter complete information");
  }

  const existingUser = await User.findOne({
    $or: [{username},{email}]
  })

if(!existingUser){
    throw new ApiError(409,"User Already exists");
}

const avatarLocalFilePath = req.files?.avatar[0]?.path;
const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

if(!avatarLocalFilePath){
    throw new ApiError(400,"Avatar file is required");
}

const avatar = await uploadCloudinary(avatarLocalFilePath);
const coverImage = await uploadCloudinary(coverImageLocalFilePath);

if(!avatar){
   throw new ApiError(400,"Avatar file is required");
}

const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase() 
})

const createdUser = await User.findById(user._id).select("-refreshToken -password");

if(!createdUser){
    throw new ApiError(500,"Something went wrong");
}

return res.status(201).json(
    new apiResponse(200,createdUser,"User registered successfully")
)

})

export default registerUser;