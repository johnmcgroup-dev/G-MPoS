import { Response } from 'express';
import { AuthenticatedRequest, asyncHandler } from '../middleware/errorHandler';
import { SalesService } from '../services/SalesService';
import { createSaleSchema } from '../validators/schemas';

const salesService = new SalesService();

export const createSale = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error, value } = createSaleSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const sale = await salesService.createSale(req.user!.tenantId, value);

  res.status(201).json({
    success: true,
    data: sale
  });
});

export const getSales = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    status: req.query.status,
    customerId: req.query.customerId,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
  };

  const sales = await salesService.getSales(req.user!.tenantId, filters);

  res.json({
    success: true,
    data: sales
  });
});

export const getSaleById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const sale = await salesService.getSaleById(id, req.user!.tenantId);

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }

  res.json({
    success: true,
    data: sale
  });
});

export const cancelSale = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const sale = await salesService.cancelSale(id);

  res.json({
    success: true,
    data: sale
  });
});

export const getSalesReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    });
  }

  const report = await salesService.getSalesReport(
    req.user!.tenantId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({
    success: true,
    data: report
  });
});
