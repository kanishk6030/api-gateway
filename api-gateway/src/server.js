import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proxy from 'express-http-proxy';
import authenticate from './middlewares/auth.js';
dotenv.config();
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - Auth: ${req.headers.authorization ? 'Yes' : 'No'}`);
  next();
});


// Routes - setting up proxy for the profile with the authentication middleware
const proxyOptions = {
    proxyReqPathResolver : (req) =>{
        // versioning the api endpoints
        return req.originalUrl.replace(/^\/v1/,"")
    },
    proxyErrorHandler: (err,res,next) =>{
        res.status(400).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        })
    }
}


// Setting up the proxy for the Profile Service
app.use("/v1/profile",authenticate,proxy(process.env.PROFILE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts, srcReq) =>{
         proxyReqOpts.headers['Content-Type'] = 'application/json';
         proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
         proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        //  console.log("Proxying request with headers:", proxyReqOpts.headers);
         return proxyReqOpts;
    },
    userResDecorator:(proxyRes, proxyResData, userReq, userRes)=>{
        return proxyResData;
    }
}));

// Health check endpoint
app.get('/ping', authenticate, (req, res) => {

    console.log("Ping request received from user:", req.user);
    res.json({ message: 'pong' });
});

// Catch-all for undefined routes
app.use((req, res) => {
  console.log("Route not found:", req.method, req.path);
  res.status(404).json({ 
    message: "Route not found",
    availableRoutes: [
      "GET /v1/profile (requires Bearer token)",
      "GET /ping (requires Bearer token)"
    ]
  });
});



app.use(errorHandler);

function startServer() {
    app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    }); 
}

startServer();
