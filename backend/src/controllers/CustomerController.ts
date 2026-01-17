import { Response } from 'express';
import { AuthenticatedRequest, asyncHandler } from '../middleware/errorHandler';
import { CustomerService } from '../services/CustomerService';
import { createCustomerSchema } from '../validators/schemas';

const customerService = new CustomerService();

export const createCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error, value } = createCustomerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const customer = await customerService.createCustomer(req.user!.tenantId, value);

  res.status(201).json({
    success: true,
    data: customer
  });
});

export const getCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    type: req.query.type,
    isActive: req.query.isActive === 'true'
  };

  const customers = await customerService.getCustomers(req.user!.tenantId, filters);

  res.json({
    success: true,
    data: customers
  });
});

export const getCustomerById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const customer = await customerService.getCustomerById(id, req.user!.tenantId);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  res.json({
    success: true,
    data: customer
  });
});

export const updateCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const customer = await customerService.updateCustomer(id, req.body);

  res.json({
    success: true,
    data: customer
  });
});

export const addLoyaltyPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId } = req.params;
  const { points } = req.body;

  const customer = await customerService.addLoyaltyPoints(customerId, points);

  res.json({
    success: true,
    data: customer
  });
});

export const redeemLoyaltyPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId } = req.params;
  const { points, discount } = req.body;

  const customer = await customerService.redeemLoyaltyPoints(customerId, points, discount);

  res.json({
    success: true,
    data: customer
  });
});

export const getTopCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const customers = await customerService.getTopCustomers(req.user!.tenantId, limit);

  res.json({
    success: true,
    data: customers
  });
});
