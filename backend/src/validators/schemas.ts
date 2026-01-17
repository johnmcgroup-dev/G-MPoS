import Joi from 'joi';

export const createTenantSchema = Joi.object({
  name: Joi.string().required().min(3),
  subdomain: Joi.string().required().min(3),
  description: Joi.string().optional(),
  contactEmail: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  country: Joi.string().optional(),
  taxId: Joi.string().optional(),
  businessLicense: Joi.string().optional()
});

export const createUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string().required(),
  role: Joi.string().valid('admin', 'manager', 'cashier', 'inventory_staff', 'accountant', 'viewer')
});

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  description: Joi.string().optional(),
  purchasePrice: Joi.number().required(),
  sellingPrice: Joi.number().required(),
  category: Joi.string().optional(),
  unit: Joi.string().optional(),
  reorderLevel: Joi.number().required(),
  expirationDate: Joi.date().optional(),
  warehouseId: Joi.string().uuid().optional()
});

export const createSaleSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().uuid().required(),
      quantity: Joi.number().required(),
      unitPrice: Joi.number().required(),
      discount: Joi.number().optional()
    })
  ).required(),
  customerId: Joi.string().uuid().optional(),
  discountAmount: Joi.number().optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'mobile_money', 'check', 'bank_transfer', 'online'),
  notes: Joi.string().optional()
});

export const createPurchaseSchema = Joi.object({
  vendorId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().uuid().required(),
      quantity: Joi.number().required(),
      unitPrice: Joi.number().required(),
      expirationDate: Joi.date().optional()
    })
  ).required(),
  expectedDeliveryDate: Joi.date().optional(),
  notes: Joi.string().optional()
});

export const createCustomerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  type: Joi.string().valid('retail', 'wholesale', 'vip')
});

export const createVendorSchema = Joi.object({
  companyName: Joi.string().required(),
  contactPerson: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  taxId: Joi.string().optional(),
  bankAccountNumber: Joi.string().optional(),
  bankName: Joi.string().optional()
});

export const createExpenseSchema = Joi.object({
  description: Joi.string().required(),
  category: Joi.string().valid('utilities', 'rent', 'salaries', 'marketing', 'transport', 'maintenance', 'supplies', 'other').required(),
  amount: Joi.number().required(),
  vendor: Joi.string().optional(),
  expenseDate: Joi.date().required(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: Joi.string().optional()
});
