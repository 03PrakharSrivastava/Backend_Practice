import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import uploadCloudinary from '../utils/cloudinary.js'
import apiResponse from '../utils/apiResponse.js';

const generateAccessandRefreshToken = async(userId)=>{
 try {
   const user = await User.findById(userId);
   const accessToken = user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

   return {accessToken,refreshToken};

 } catch (error) {
   throw new ApiError(500,'Something went wrong');
 }
}

const registerUser = asyncHandler(async(res,res)=>{
  const {username,email,fullname,password} = res.body;

  if([fullname,email,password,username].some((field)=> field==="")){
    throw new ApiError(400,"Enter complete information");
  }

  const existingUser = await User.findOne({
    $or: [{username},{email}]
  })

if(existingUser){
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

const loginUser = asyncHandler(async(req,res)=>{
  const {username,password,email} = req.body;

  if(!username || !email){
    throw new ApiError(400,"Username or Email are required");
  }

  const user = await User.findOne({
    $or: [{username},{email}]
  });

  if(!user){
    throw new ApiError(400,"User doesn't exist");
  }

  const passwordChecking = await user.isPasswordCorrect(password);

  if(!passwordChecking){
    throw new ApiError(401,'Invalid Credentials');
  }

   const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id);
   
   const loggedIn = await User.findById(user._id).select('-password -refreshToken');
  
   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new apiResponse(200,{
      user: accessToken,loggedIn,refreshToken
    },
  "User logged In successfully")
   );
})

export {registerUser,loginUser};