import { Response } from 'express';
import { AuthenticatedRequest, asyncHandler } from '../middleware/errorHandler';
import { AuthService } from '../services/AuthService';
import { createUserSchema } from '../validators/schemas';

const authService = new AuthService();

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error, value } = createUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const result = await authService.register(req.user!.tenantId, value);

  res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!email || !password || !tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and tenant ID are required'
    });
  }

  const result = await authService.login(email, password, tenantId);

  res.json({
    success: true,
    data: result
  });
});
