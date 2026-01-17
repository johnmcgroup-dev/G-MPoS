# API Endpoints Reference

## Authentication Endpoints

### Login
- **URL**: `POST /api/auth/login`
- **Headers**: 
  - `x-tenant-id: {tenantId}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "admin"
      },
      "token": "jwt_token"
    }
  }
  ```

## Inventory Endpoints

### Get All Products
- **URL**: `GET /api/inventory`
- **Query Parameters**:
  - `category`: Filter by category
  - `warehouseId`: Filter by warehouse
  - `isActive`: true/false
  - `lowStock`: true/false
- **Response**: Array of inventory items

### Create Product
- **URL**: `POST /api/inventory/products`
- **Body**:
  ```json
  {
    "name": "Product Name",
    "sku": "SKU123",
    "purchasePrice": 10.00,
    "sellingPrice": 15.00,
    "reorderLevel": 50,
    "category": "Electronics",
    "unit": "pcs",
    "warehouseId": "uuid"
  }
  ```

### Get Product by Barcode
- **URL**: `GET /api/inventory/barcode/{barcode}`
- **Response**: Single product object

### Get Product by SKU
- **URL**: `GET /api/inventory/sku/{sku}`
- **Response**: Single product object

### Get Low Stock Items
- **URL**: `GET /api/inventory/low-stock`
- **Response**: Array of items below reorder level

### Get Expiring Items
- **URL**: `GET /api/inventory/expiring`
- **Query Parameters**:
  - `days`: Number of days to check (default: 30)
- **Response**: Array of expiring items sorted by expiration date

### Get Inventory Value
- **URL**: `GET /api/inventory/value`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalInventoryValue": 5000.00
    }
  }
  ```

## Sales Endpoints

### Create Sale
- **URL**: `POST /api/sales`
- **Body**:
  ```json
  {
    "items": [
      {
        "inventoryItemId": "uuid",
        "quantity": 5,
        "unitPrice": 15.00,
        "discount": 0
      }
    ],
    "customerId": "uuid (optional)",
    "paymentMethod": "cash",
    "discountAmount": 0,
    "notes": "Optional notes"
  }
  ```

### Get All Sales
- **URL**: `GET /api/sales`
- **Query Parameters**:
  - `status`: pending/completed/cancelled/refunded
  - `customerId`: Filter by customer
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Sale Details
- **URL**: `GET /api/sales/{saleId}`
- **Response**: Complete sale with items and payments

### Cancel Sale
- **URL**: `DELETE /api/sales/{saleId}`
- **Response**: Updated sale with cancelled status

### Get Sales Report
- **URL**: `GET /api/sales/reports/summary`
- **Query Parameters**:
  - `startDate`: ISO date (required)
  - `endDate`: ISO date (required)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalSales": 100,
      "totalRevenue": 5000.00,
      "totalVAT": 375.00,
      "totalDiscount": 0,
      "completedSales": 95,
      "cancelledSales": 5,
      "byPaymentMethod": {},
      "byProduct": {}
    }
  }
  ```

## Purchase Endpoints

### Create Purchase Order
- **URL**: `POST /api/purchases`
- **Body**:
  ```json
  {
    "vendorId": "uuid",
    "items": [
      {
        "inventoryItemId": "uuid",
        "quantity": 100,
        "unitPrice": 10.00,
        "expirationDate": "2026-12-31"
      }
    ],
    "expectedDeliveryDate": "2026-02-01",
    "discountAmount": 0,
    "notes": "Optional notes"
  }
  ```

### Receive Purchase Items
- **URL**: `POST /api/purchases/{purchaseId}/receive`
- **Body**:
  ```json
  {
    "items": [
      {
        "purchaseItemId": "uuid",
        "quantity": 50
      }
    ]
  }
  ```

### Get All Purchases
- **URL**: `GET /api/purchases`
- **Query Parameters**:
  - `status`: draft/pending/received/completed/cancelled
  - `vendorId`: Filter by vendor

### Get Purchase Report
- **URL**: `GET /api/purchases/reports/summary`
- **Query Parameters**:
  - `startDate`: ISO date (required)
  - `endDate`: ISO date (required)

## Customer Endpoints

### Create Customer
- **URL**: `POST /api/customers`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "type": "retail"
  }
  ```

### Get All Customers
- **URL**: `GET /api/customers`
- **Query Parameters**:
  - `type`: retail/wholesale/vip
  - `isActive`: true/false

### Get Customer Details
- **URL**: `GET /api/customers/{customerId}`

### Update Customer
- **URL**: `PATCH /api/customers/{customerId}`
- **Body**: Partial customer object

### Add Loyalty Points
- **URL**: `POST /api/customers/{customerId}/loyalty/add`
- **Body**:
  ```json
  {
    "points": 100
  }
  ```

### Redeem Loyalty Points
- **URL**: `POST /api/customers/{customerId}/loyalty/redeem`
- **Body**:
  ```json
  {
    "points": 100,
    "discount": 10.00
  }
  ```

### Get Top Customers
- **URL**: `GET /api/customers/top`
- **Query Parameters**:
  - `limit`: Number of customers (default: 10)

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Authentication Header

All protected endpoints require:
```
Authorization: Bearer {jwt_token}
X-Tenant-ID: {tenantId}
```
