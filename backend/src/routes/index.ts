import { Router } from 'express';
import { authenticateToken } from '../middleware/authentication';
import * as authController from '../controllers/AuthController';
import * as inventoryController from '../controllers/InventoryController';
import * as salesController from '../controllers/SalesController';
import * as purchaseController from '../controllers/PurchaseController';
import * as customerController from '../controllers/CustomerController';

const router = Router();

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authenticateToken, authController.register);

// Inventory Routes
router.post('/inventory/products', authenticateToken, inventoryController.createProduct);
router.get('/inventory', authenticateToken, inventoryController.getInventory);
router.get('/inventory/sku/:sku', authenticateToken, inventoryController.getProductBySKU);
router.get('/inventory/barcode/:barcode', authenticateToken, inventoryController.getProductByBarcode);
router.get('/inventory/low-stock', authenticateToken, inventoryController.getLowStockItems);
router.get('/inventory/expiring', authenticateToken, inventoryController.getExpiringItems);
router.get('/inventory/value', authenticateToken, inventoryController.getInventoryValue);
router.patch('/inventory/products/:id', authenticateToken, inventoryController.updateProduct);
router.get('/inventory/:itemId/transactions', authenticateToken, inventoryController.getItemTransactionHistory);

// Sales Routes
router.post('/sales', authenticateToken, salesController.createSale);
router.get('/sales', authenticateToken, salesController.getSales);
router.get('/sales/:id', authenticateToken, salesController.getSaleById);
router.delete('/sales/:id', authenticateToken, salesController.cancelSale);
router.get('/sales/reports/summary', authenticateToken, salesController.getSalesReport);

// Purchase Routes
router.post('/purchases', authenticateToken, purchaseController.createPurchase);
router.post('/purchases/:id/receive', authenticateToken, purchaseController.receivePurchase);
router.get('/purchases', authenticateToken, purchaseController.getPurchases);
router.get('/purchases/reports/summary', authenticateToken, purchaseController.getPurchasesReport);

// Customer Routes
router.post('/customers', authenticateToken, customerController.createCustomer);
router.get('/customers', authenticateToken, customerController.getCustomers);
router.get('/customers/top', authenticateToken, customerController.getTopCustomers);
router.get('/customers/:id', authenticateToken, customerController.getCustomerById);
router.patch('/customers/:id', authenticateToken, customerController.updateCustomer);
router.post('/customers/:customerId/loyalty/add', authenticateToken, customerController.addLoyaltyPoints);
router.post('/customers/:customerId/loyalty/redeem', authenticateToken, customerController.redeemLoyaltyPoints);

export default router;
