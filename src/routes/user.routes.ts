import { Router } from 'express';
import {AuthController} from "../controller/user.controller"

const authController= new AuthController()

const router = Router();

router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/verify-email', authController.verifyEmail);
router.post("/logout",authController.logout);

export default router;
