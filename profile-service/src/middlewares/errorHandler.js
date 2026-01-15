import logger from "../utils/logger";

export const errorHandler = (err,req,res,next) =>{
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    res.status(err.status || 500).json({
        message:err.message || "Internal Server Error",
    });
}
