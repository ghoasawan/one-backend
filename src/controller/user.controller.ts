import { Request, Response } from "express";
import { User } from "../entities/user.enitity";
import { AppDataSource } from "../config/database";
import {
  generateToken,
  generateVerificationToken,
  verifyToken,
} from "../lib/token_generation";
import { sendVerificationEmail } from "../lib/nodemailer";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    throw new AppError(400, "Please provide credentials");
  }

  const userRepository = AppDataSource.getRepository(User);

  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    throw new AppError(400, "User with this email already exists");
  }

  const user = userRepository.create({
    name,
    email,
    phone,
    password,
  });

  await userRepository.save(user);

  // Generate verification token and send email
  const verificationToken = generateVerificationToken({
    userId: user.id,
    email: user.email,
  });

  await sendVerificationEmail(user.email, verificationToken);

  res.cookie("userId", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 1000, // 1 minute
    sameSite: "strict",
  });

  res.status(201).json({
    message:
      "User created successfully. Please check your email to verify your account.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email or Password missing");
  }

  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    throw new AppError(404, "User with this email does not exist");
  }

  if (user.password !== password) {
    throw new AppError(401, "Invalid password");
  }

  if (!user.is_verified) {
    throw new AppError(401, "Please verify your Email");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 1000, // 1 minute
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      email: user.email,
      password: user.password,
    },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(400, "Verification token is required");
  }

  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") {
    throw new AppError(401, "Invalid or expired verification token");
  }

  const user_Id = req.cookies["userId"];
  console.log("user", user_Id);

  const userId = (decoded as any).userId;
  const email = (decoded as any).email;

  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId, email: email },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (userId !== user_Id) {
    throw new AppError(401, "Invalid Token");
  }

  user.is_verified = true;

  res.clearCookie("UserId", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  await userRepository.save(user);

  const authtoken = generateToken({
    userId: user.id,
    email: user.email,
  });

  res.cookie("token", authtoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 1000, // 1 minute
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Email verified successfully",
    user: { token: authtoken, email: email },
  });
});
