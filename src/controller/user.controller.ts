import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {UserDto} from "../Dtos/index"
import {AuthService} from '../services/auth.service'



export class AuthController {

  private authService:AuthService
  constructor() {
    this.authService=new AuthService();
  }

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user:UserDto = req.body;

   const newUser=await  this.authService.createUser(user);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { token, user } = await this.authService.loginUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      auth_token:token,
      user,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const { token: authToken, user } = await this.authService.verifyEmail(token);

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Email verified successfully",
      auth_token: authToken,
      user,
    });
  });


  logout = asyncHandler((req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  });
}
