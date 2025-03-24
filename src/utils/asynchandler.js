//asynchandler is a higeher order  function//

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch((error) => {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            });
        });
};

/*
const asyncHandler=(fn)=> async(req,res,next)=>{
   try{
  //execute function taken in argument//
   await fn(req,res,next);

   }catch(error)
   {
    res.status(err.code || 500).json({
        success:false,
        message:err.message
    })
   }


};

*/