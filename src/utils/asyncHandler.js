
// method 1
const asyncHandler = (fn)=> async(req ,res,next)=>{
  try{
   await fn(req,res,next);
  }
  catch(err){
    console.log('Errors: ',err);
  }
}

// method 2
const asyncHandler1 = (fn)=>{
  (req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch((err)=>next(err));
  }
}