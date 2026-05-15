import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {UserDto} from "../Dtos/index.js"
import {AuthService} from '../services/auth.service.js'
import { inject, injectable } from "inversify";
import { TYPES } from "../types/index.js";



@injectable()
export class AuthController {

  constructor(@inject(TYPES.AuthService) private authService:AuthService) {}

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user:UserDto = req.body;
   const newUser=await  this.authService.createUser(user);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      user: { id: newUser.id,name:user.name, email: newUser.email },
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
      user:{id:user.id, email:user.email, name:user.name},
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    console.log("token", token)

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
      user:{id:user.id, email:user.email, name:user.name}
    });
  });


  logout = asyncHandler(async (req: Request, res: Response) => {
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

  resetVerificationLink=asyncHandler(async (req:Request, res:Response)=>{

    const {email}=req.body;

    await this.authService.resendVerificationLink(email)

    return res.status(200).json({message:"Verification Link send to the email"})
  })
}
