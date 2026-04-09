import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.routes.js";
import { AppDataSource } from "./src/config/database.js";
import { AppError } from "./src/utils/AppError.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

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
