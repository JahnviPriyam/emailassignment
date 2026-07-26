import { Request, Response, NextFunction } from 'express';
import { schedulerService } from '../services/schedulerService';

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const sender = (req.query.sender as string) || 'admin@reachinbox.ai';
      const name = req.query.name as string | undefined;
      const image = req.query.image as string | undefined;

      const result = await schedulerService.getUserStats(sender, name, image);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Backend logout event logging or token blacklisting if needed
      console.log(`[Auth] User requested logout: ${req.body?.email || 'Anonymous'}`);
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully from backend session.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
