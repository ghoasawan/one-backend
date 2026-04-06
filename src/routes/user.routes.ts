import { Router } from 'express';
import { createUser, loginUser, verifyEmail } from '../controller/user.controller';

const router = Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);

export default router;
