import { Response } from 'express';
import { AuthenticatedRequest, asyncHandler } from '../middleware/errorHandler';
import { InventoryService } from '../services/InventoryService';
import { createProductSchema } from '../validators/schemas';

const inventoryService = new InventoryService();

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { error, value } = createProductSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const product = await inventoryService.createProduct(req.user!.tenantId, value);

  res.status(201).json({
    success: true,
    data: product
  });
});

export const getInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    category: req.query.category,
    warehouseId: req.query.warehouseId,
    isActive: req.query.isActive === 'true',
    lowStock: req.query.lowStock === 'true'
  };

  const inventory = await inventoryService.getInventory(req.user!.tenantId, filters);

  res.json({
    success: true,
    data: inventory
  });
});

export const getProductBySKU = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sku } = req.params;
  const product = await inventoryService.getItemBySKU(req.user!.tenantId, sku);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

export const getProductByBarcode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { barcode } = req.params;
  const product = await inventoryService.getItemByBarcode(req.user!.tenantId, barcode);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

export const getLowStockItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const items = await inventoryService.getItemsBelowReorderLevel(req.user!.tenantId);

  res.json({
    success: true,
    data: items
  });
});

export const getExpiringItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const items = await inventoryService.getItemsExpiringSoon(req.user!.tenantId, days);

  res.json({
    success: true,
    data: items
  });
});

export const getInventoryValue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const value = await inventoryService.getInventoryValue(req.user!.tenantId);

  res.json({
    success: true,
    data: { totalInventoryValue: value }
  });
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = await inventoryService.updateProduct(id, req.body);

  res.json({
    success: true,
    data: product
  });
});

export const getItemTransactionHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { itemId } = req.params;
  const limit = parseInt(req.query.limit as string) || 100;
  const transactions = await inventoryService.getItemTransactionHistory(itemId, limit);

  res.json({
    success: true,
    data: transactions
  });
});
