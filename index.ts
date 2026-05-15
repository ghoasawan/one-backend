import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.routes.js";
import { AppDataSource } from "./src/config/database.js";
import { AppError } from "./src/utils/AppError.js";
import cors from "cors"

const app = express();

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if you are using Cookies or Sessions
};

app.use(cors(corsOptions))

// Routes
app.use('/api', userRoutes);


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(3001, () => {
      console.log("listening on port 3001");
    });
  })
  .catch((error) => console.log("Database connection error:", error));
