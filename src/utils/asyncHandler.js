
// method 1
const asyncHandler1 = (fn)=> async(req ,res,next)=>{
  try{
   await fn(req,res,next);
  }
  catch(err){
    console.log('Errors: ',err);
  }
}

// method 2
const asyncHandler = (fn)=>{
 return (req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch((err)=>next(err));
  }
}