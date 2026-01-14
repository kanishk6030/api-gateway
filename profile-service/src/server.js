import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import profileRoutes from './routes/profile.js'
dotenv.config();
import { errorHandler } from './middlewares/errorHandler.js';   

const app = express();
const PORT = process.env.PORT || 4001;
app.use(cors());
app.use(express.json());

// Routes
app.use('/profile', profileRoutes);
app.use(errorHandler);

function startServer() {    
    app.listen(PORT, () => {
        console.log(`Profile Service running on port ${PORT}`);
    });
}   
startServer();