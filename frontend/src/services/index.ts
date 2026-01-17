import apiClient from './api';

export const AuthAPI = {
  login: async (email: string, password: string, tenantId: string) => {
    const response = await apiClient.post('/auth/login', { email, password }, {
      headers: { 'x-tenant-id': tenantId }
    });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
};

export const InventoryAPI = {
  createProduct: (data: any) => apiClient.post('/inventory/products', data),
  getInventory: (filters?: any) => apiClient.get('/inventory', { params: filters }),
  getProductBySKU: (sku: string) => apiClient.get(`/inventory/sku/${sku}`),
  getProductByBarcode: (barcode: string) => apiClient.get(`/inventory/barcode/${barcode}`),
  getLowStockItems: () => apiClient.get('/inventory/low-stock'),
  getExpiringItems: (days?: number) => apiClient.get('/inventory/expiring', { params: { days } }),
  getInventoryValue: () => apiClient.get('/inventory/value'),
  updateProduct: (id: string, data: any) => apiClient.patch(`/inventory/products/${id}`, data),
  getTransactionHistory: (itemId: string, limit?: number) => 
    apiClient.get(`/inventory/${itemId}/transactions`, { params: { limit } }),
};

export const SalesAPI = {
  createSale: (data: any) => apiClient.post('/sales', data),
  getSales: (filters?: any) => apiClient.get('/sales', { params: filters }),
  getSaleById: (id: string) => apiClient.get(`/sales/${id}`),
  cancelSale: (id: string) => apiClient.delete(`/sales/${id}`),
  getSalesReport: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/summary', { params: { startDate, endDate } }),
};

export const PurchaseAPI = {
  createPurchase: (data: any) => apiClient.post('/purchases', data),
  receivePurchase: (id: string, items: any) => apiClient.post(`/purchases/${id}/receive`, { items }),
  getPurchases: (filters?: any) => apiClient.get('/purchases', { params: filters }),
  getPurchasesReport: (startDate: string, endDate: string) =>
    apiClient.get('/purchases/reports/summary', { params: { startDate, endDate } }),
};

export const CustomerAPI = {
  createCustomer: (data: any) => apiClient.post('/customers', data),
  getCustomers: (filters?: any) => apiClient.get('/customers', { params: filters }),
  getCustomerById: (id: string) => apiClient.get(`/customers/${id}`),
  updateCustomer: (id: string, data: any) => apiClient.patch(`/customers/${id}`, data),
  addLoyaltyPoints: (customerId: string, points: number) =>
    apiClient.post(`/customers/${customerId}/loyalty/add`, { points }),
  redeemLoyaltyPoints: (customerId: string, points: number, discount: number) =>
    apiClient.post(`/customers/${customerId}/loyalty/redeem`, { points, discount }),
  getTopCustomers: (limit?: number) => apiClient.get('/customers/top', { params: { limit } }),
};
