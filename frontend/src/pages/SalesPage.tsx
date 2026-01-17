import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';
import { SalesAPI, InventoryAPI } from '../services';
import { useAuthStore } from '../store/authStore';

interface SaleItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function SalesPage() {
  const { tenantId } = useAuthStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');

  const { data: products } = useQuery({
    queryKey: ['inventory', tenantId],
    queryFn: () => InventoryAPI.getInventory(),
  });

  const { mutate: createSale, isPending } = useMutation({
    mutationFn: (data: any) => SalesAPI.createSale(data),
    onSuccess: () => {
      alert('Sale created successfully!');
      setSaleItems([]);
      setBarcode('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create sale');
    },
  });

  const handleAddItem = async () => {
    if (!barcode) return;

    try {
      const response = await InventoryAPI.getProductByBarcode(barcode);
      const product = response.data.data;

      const existingItem = saleItems.find(item => item.inventoryItemId === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
        setSaleItems([...saleItems]);
      } else {
        setSaleItems([
          ...saleItems,
          {
            inventoryItemId: product.id,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
          },
        ]);
      }

      setBarcode('');
    } catch (err: any) {
      setError('Product not found');
    }
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleCreateSale = () => {
    if (saleItems.length === 0) {
      setError('Add items to the sale');
      return;
    }

    createSale({
      items: saleItems,
      customerId: customerEmail || undefined,
      paymentMethod,
    });
  };

  const subtotal = saleItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const vatAmount = subtotal * 0.075;
  const total = subtotal + vatAmount;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Point of Sale</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          New Sale
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Scan Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem();
                    }
                  }}
                  placeholder="Scan product barcode..."
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saleItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>Product {index + 1}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unitPrice}</TableCell>
                        <TableCell align="right">${item.discount}</TableCell>
                        <TableCell align="right">
                          ${(item.quantity * item.unitPrice - item.discount).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sale Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>VAT (7.5%):</Typography>
                <Typography>${vatAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
                <Typography>Total:</Typography>
                <Typography>${total.toFixed(2)}</Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Payment Method"
              select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 2 }}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="check">Check</option>
            </TextField>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCreateSale}
              disabled={isPending || saleItems.length === 0}
            >
              Complete Sale
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
