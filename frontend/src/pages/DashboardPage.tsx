import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryAPI, SalesAPI } from '../services';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { tenantId } = useAuthStore();

  const { data: inventoryValue } = useQuery({
    queryKey: ['inventoryValue', tenantId],
    queryFn: () => InventoryAPI.getInventoryValue(),
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['lowStock', tenantId],
    queryFn: () => InventoryAPI.getLowStockItems(),
  });

  const { data: expiringItems } = useQuery({
    queryKey: ['expiringItems', tenantId],
    queryFn: () => InventoryAPI.getExpiringItems(30),
  });

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: salesReport } = useQuery({
    queryKey: ['salesReport', tenantId],
    queryFn: () => SalesAPI.getSalesReport(
      thirtyDaysAgo.toISOString(),
      today.toISOString()
    ),
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inventory Value
              </Typography>
              <Typography variant="h5">
                ${inventoryValue?.data?.totalInventoryValue?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales (30 days)
              </Typography>
              <Typography variant="h5">
                ${salesReport?.data?.totalRevenue?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h5">
                {lowStockItems?.data?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expiring Soon
              </Typography>
              <Typography variant="h5">
                {expiringItems?.data?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales Trend (30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[{ day: 'Today', sales: salesReport?.data?.totalSales || 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
