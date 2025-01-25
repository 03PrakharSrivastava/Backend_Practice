import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import uploadCloudinary from '../utils/cloudinary.js'
import apiResponse from '../utils/apiResponse.js';
import jwt from "jsonwebtoken";

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

const logOut = asyncHandler(async(req,res)=>{
// removing refreshToken from db
 await User.findByIdAndUpdate(req.user._id,
  {
    $set: {refreshToken: undefined}
  },
  {
    new : true
  }
 );

 // cookies remove
 const options = {
  httpOnly: true,
  secure: true
 }

 return res
 .status(200)
 .clearCookie('accessToken',options)
 .clearCookie('refreshToken',options)
 .json(new apiResponse(200,{},"User Logged Out Successfully"));
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized Access");
  }

  try{
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new ApiError(401,"invalid refresh token");
    }
  
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401, "Refresh Token is user or expired");
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await User.generateAccessandRefreshToken(user._id);
  
    return res
    .status(200)
    .cookiee('accessToken',accessToken,options)
    .cookiee('refreshToken',newRefreshToken,options)
    .json(
      new apiResponse(200,{accessToken,refreshToken: newRefreshToken},"Access Token Refreshed")
    )
  }
  catch(error){
  throw new ApiError(400,"Something went wrong");
  }
  
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError('401',"Invalid Credentials");
  }

  user.password = oldPassword;
  user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json(new apiResponse(200,{},"Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"Current User Fetched");
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body;

  if(!fullname && !email){
    throw new ApiError(400,"All field are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new: true}
  ).select('-password');

  return res
  .status(200)
  .json(new apiResponse(200,user,"Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar Not Found");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);

  if(!avatar.url){
       throw new ApiError(400,"Error while uploading avatar");
  }

  const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select('-password')

  return res
  .status(200)
  .json(new apiResponse(200,user,"Avatar Uploaded Successfully"));
})

export {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar};