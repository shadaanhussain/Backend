import  express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({
    limit: "16kb",
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

//Import Routes
import  userRouter from './routes/user.routes.js';



//Routes Declaration
app.use('/api/v1/users', userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

export {app}