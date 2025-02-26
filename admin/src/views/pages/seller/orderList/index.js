import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllOrder, updateOrderStatus } from "features/orderSlice";

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.orders);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const theme = useTheme();
  const [statusUpdates, setStatusUpdates] = useState({}); // Store temporary status changes

  useEffect(() => {
    dispatch(fetchAllOrder());
  }, [dispatch]);

  // Handle order status change
  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [orderId]: newStatus }));

    // Debounced API call to avoid multiple quick updates
    setTimeout(() => {
      dispatch(updateOrderStatus({ orderId: orderId, status: newStatus }));
    }, 500);
  };

  const columns = [
    {
      field: "index",
      headerName: "No",
      width: 60,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
    },
    { field: "orderId", headerName: "Order ID", width: isMobile ? 100 : 150 },
    { field: "userId", headerName: "User ID", width: isMobile ? 120 : 200 },
    {
      field: "cardHolderName",
      headerName: "Name",
      width: isMobile ? 100 : 150,
      renderCell: (params) => params.row.paymentId?.cardHolderName || "N/A",
    },
    {
      field: "totalPrice",
      headerName: "Total ($)",
      width: isMobile ? 80 : 120,
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 180,
      renderCell: (params) => (
        <Select
          value={statusUpdates[params.row.orderId] || params.row.status}
          onChange={(e) => handleStatusChange(params.row.orderId, e.target.value)}
          sx={{ width: "100%" }}
        >
          {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
            (status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            )
          )}
        </Select>
      ),
    },
    {
      field: "seller",
      headerName: "Seller",
      width: 150,
      renderCell: (params) => {
        if (!params.row.items || !Array.isArray(params.row.items)) return "N/A";
        const sellerNames = params.row.items
          .map((item) => item.sellerId?.name || "Unknown")
          .filter((name) => name !== "Unknown");
        return sellerNames.length > 0 ? sellerNames.join(", ") : "N/A";
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ height: 500, width: "100%", overflowX: "auto" }}>
          <DataGrid
            rows={orders}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row._id}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.mode === "dark" ? "#333" : "white",
                color: theme.palette.mode === "dark" ? "white" : "black",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: theme.palette.mode === "dark" ? "#222" : "white",
                color: theme.palette.mode === "dark" ? "white" : "black",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default OrderList;
