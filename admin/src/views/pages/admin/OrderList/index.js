import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import { Visibility, Print } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrder } from 'features/orderSlice';

const OrderList = () => {
  const { orders, loading, error } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrder());
  }, [dispatch]);

  const handleView = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Order Details</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          img { width: 50px; height: 50px; object-fit: cover; }
        </style>
      </head>
      <body>
        <h1>Order Details</h1>
        <p><strong>Order ID:</strong> ${selectedOrder.orderId}</p>
        <p><strong>User ID:</strong> ${selectedOrder.userId}</p>
        <p><strong>Name:</strong> ${selectedOrder.paymentId?.cardHolderName}</p>
        <p><strong>Status:</strong> ${selectedOrder.status}</p>
        <p><strong>Total Price:</strong> $${selectedOrder.totalPrice}</p>
        <p><strong>Delivery Date:</strong> ${
          selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'N/A'
        }</p>
        
        <h2>Order Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Image</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Seller</th>
            </tr>
          </thead>
          <tbody>
            ${selectedOrder.items
              .map(
                (item) => `
                <tr>
                  <td>${item.title}</td>
                  <td><img src="${item.image}" alt="${item.title}" /></td>
                  <td>${item.category}</td>
                  <td>$${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>${item.sellerId?.name}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const columns = [
    { field: 'index', headerName: 'No', width: 60, renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 },
    { field: 'orderId', headerName: 'Order ID', width: isMobile ? 100 : 150 },
    { field: 'userId', headerName: 'User ID', width: isMobile ? 120 : 200 },
    {
      field: 'cardHolderName',
      headerName: 'Name',
      width: isMobile ? 100 : 150,
      renderCell: (params) => params.row.paymentId?.cardHolderName || 'N/A'
    },

    {
      field: 'totalPrice',
      headerName: 'Total ($)',
      width: isMobile ? 80 : 120,
      renderCell: (params) => `$${params.value}`
    },
    { field: 'status', headerName: 'Status', width: 150 },

    {
      field: 'seller',
      headerName: 'Seller',
      width: 150,
      renderCell: (params) => {
        if (!params.row.items || !Array.isArray(params.row.items)) return 'N/A';

        const sellerNames = params.row.items
          .map((item) => (item.sellerId && item.sellerId.name ? item.sellerId.name : 'Unknown'))
          .filter((name) => name !== 'Unknown'); // Remove empty values

        return sellerNames.length > 0 ? sellerNames.join(', ') : 'N/A';
      }
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleView(params.row)}>
          <Visibility />
        </IconButton>
      )
    }
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center">
        Order Management
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ boxShadow: 3, borderRadius: 2, bgcolor: '#fff', p: 2 }}>
          <DataGrid
            rows={orders}
            columns={columns}
            pageSize={5}
            autoHeight
            getRowId={(row) => row._id}
            sx={{
              '& .MuiDataGrid-root': {
                backgroundColor: '#fff'
              }
            }}
          />
        </Box>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={open} onClose={handleClose} fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              <strong>Order ID:</strong> {selectedOrder.orderId}
            </Typography>
            <Typography variant="body1">
              <strong>User ID:</strong> {selectedOrder.userId}
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {selectedOrder.paymentId?.cardHolderName}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {selectedOrder.status}
            </Typography>
            <Typography variant="body1">
              <strong>Total Price:</strong> ${selectedOrder.totalPrice}
            </Typography>
            <Typography variant="body1">
              <strong>Delivery Date:</strong>{' '}
              {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'N/A'}
            </Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Order Items
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedOrder.items.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={item.image} alt={item.title} sx={{ width: 50, height: 50 }} />
                  <Box>
                    <Typography variant="body1">
                      <strong>{item.title}</strong> ({item.category})
                    </Typography>
                    <Typography variant="body2">
                      Price: ${item.price} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">Seller: {item.sellerId?.name}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePrint} startIcon={<Print />} color="primary">
              Print
            </Button>
            <Button onClick={handleClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default OrderList;
