import { Router } from 'express';
import { scheduleController } from '../controllers/scheduleController';
import { userController } from '../controllers/userController';

const router = Router();

// Scheduling routes
router.post('/schedule', (req, res, next) => scheduleController.schedule(req, res, next));
router.get('/scheduled', (req, res, next) => scheduleController.getScheduled(req, res, next));
router.get('/sent', (req, res, next) => scheduleController.getSent(req, res, next));

// User and Auth routes
router.get('/user', (req, res, next) => userController.getUser(req, res, next));
router.post('/logout', (req, res, next) => userController.logout(req, res, next));

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;
