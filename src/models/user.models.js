import mongoose,{Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jsonwebtokens from 'jsonwebtokens'

const userSchema = new Schema({
   username:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index:true
   },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true
   },
   fullname:{
    type: String,
    required: true,
    trim: true,
    index: true
   },
   avatar: {
    type: String,
    required: true,
   },
   coverImage:{ 
   type: String,
   required: true,
   },
   watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Video',
   }],
   password: {
    type: String,
    required: [true,'Password is required']
   },
   refreshToken: {
    type: String
   }
},
{timestamps: true});


userSchema.pre('save', async function (next){
    if(!isModified(this.password)) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
 return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
     return  jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
     },
     process.env.ACCESS_TOKEN,
    {
      expiresin: process.env.EXPIRE_ACCESS
    })
}

userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({
        _id: this._id,
     },
     process.env.ACCESS_REFRESH_TOKEN,
    {
      expiresin: process.env.EXPIRE_REFRESH_ACCESS
    })
}

export const User = mongoose.model('User',userSchema);