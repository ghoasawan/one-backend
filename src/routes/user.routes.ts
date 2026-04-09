import { Router } from 'express';
import {myContainer} from "../config/inversify.config.js"
import { TYPES } from "../types/index.js";
import type { AuthController } from "../controller/user.controller.js";

const router = Router();

const authController = myContainer.get<AuthController>(TYPES.AuthController);
router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/verify-email', authController.verifyEmail);
router.post("/logout",authController.logout);

export default router;
