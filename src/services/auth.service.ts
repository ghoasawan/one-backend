import type { UserDto } from "../Dtos/index";
import { AppError } from "../utils/AppError";
import { UserRepository } from "../repositories/user.repository";
import {
  generateToken,
  generateVerificationToken,
  verifyToken,
} from "../lib/token_generation";
import { sendVerificationEmail } from "../lib/nodemailer";
import bcrypt from "bcrypt";

export class AuthService {
  private userRepo: UserRepository;
  
  constructor() {
    this.userRepo = new UserRepository();
  }

  createUser = async (user: UserDto) => {
    const { name, email, password, phone } = user;
    if (!name || !email || !phone || !password) {
      throw new AppError(400, "Please provide credentials");
    }

    const userExists = await this.userRepo.findUser(email);

    if (userExists) {
      throw new AppError(409, "User already exists");
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepo.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const verificationToken = generateVerificationToken({
      userId: newUser.id,
      email: newUser.email,
    });
    
    await sendVerificationEmail(newUser.email, verificationToken);

    return newUser;
  };

  loginUser = async (email: string, password: string) => {
    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    const user = await this.userRepo.findUser(email);

    if (!user) {
      throw new AppError(404, "User with this email does not exist");
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid password");
    }

    if (!user.is_verified) {
      throw new AppError(401, "Please verify your email before logging in");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  };

  verifyEmail = async (token: string) => {
    if (!token) {
      throw new AppError(400, "Verification token is required");
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === "string") {
      throw new AppError(401, "Invalid or expired verification token");
    }

    const userId = (decoded as any).userId;
    const email = (decoded as any).email;

    const user = await this.userRepo.findUserById(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.email !== email) {
      throw new AppError(401, "Invalid verification token");
    }

    if (user.is_verified) {
      throw new AppError(400, "Email is already verified");
    }

    user.is_verified = true;
    await this.userRepo.saveUser(user);

    const authToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  };
}
