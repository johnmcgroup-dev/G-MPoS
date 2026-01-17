import { Response } from 'express';
import { AuthenticatedRequest, asyncHandler } from '../middleware/errorHandler';
import { PurchaseService } from '../services/PurchaseService';
import { createPurchaseSchema } from '../validators/schemas';

const purchaseService = new PurchaseService();

export const createPurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error, value } = createPurchaseSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const purchase = await purchaseService.createPurchase(req.user!.tenantId, value);

  res.status(201).json({
    success: true,
    data: purchase
  });
});

export const receivePurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { items } = req.body;

  const purchase = await purchaseService.receivePurchase(id, items);

  res.json({
    success: true,
    data: purchase
  });
});

export const getPurchases = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    status: req.query.status,
    vendorId: req.query.vendorId
  };

  const purchases = await purchaseService.getPurchases(req.user!.tenantId, filters);

  res.json({
    success: true,
    data: purchases
  });
});

export const getPurchasesReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    });
  }

  const report = await purchaseService.getPurchasesReport(
    req.user!.tenantId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({
    success: true,
    data: report
  });
});
