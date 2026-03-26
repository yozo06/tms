import { Router } from 'express';
import authRouter from './routes/auth';
import usersRouter from './routes/users';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;
