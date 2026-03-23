import { Router } from 'express';
import treesRouter from './routes/trees';
import mapRouter from './routes/map';
import speciesRouter from './routes/species';
import zonesRouter from './routes/zones';
import dashboardRouter from './routes/dashboard';

const router = Router();

router.use('/trees', treesRouter);
router.use('/map', mapRouter);
router.use('/species', speciesRouter);
router.use('/zones', zonesRouter);
router.use('/dashboard', dashboardRouter);

export default router;
