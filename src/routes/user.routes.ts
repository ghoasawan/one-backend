import { Router } from 'express';
import {myContainer} from "../config/inversify.config.js"
import { TYPES } from "../types/index.js";
import type { AuthController } from "../controller/user.controller.js";

const router = Router();

const authController = myContainer.get<AuthController>(TYPES.AuthController);
router.post('/auth/register', authController.createUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/verify-email', authController.verifyEmail);
router.post("/auth/logout",authController.logout);
router.post("/resend-verification",authController.resetVerificationLink)

export default router;
