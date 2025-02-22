import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "utils/axiosintance";

// Add a new product
export const AddProduct = createAsyncThunk(
  "products/addProduct",
  async (newProduct, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/products", newProduct);
      return response.data.product; // API should return the new product
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

// Fetch all products
export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (sellerId, { rejectWithValue }) => {
    try {
      if (!sellerId) return rejectWithValue("Seller ID is required");

      const response = await api.get(`/api/products?sellerId=${sellerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

// Delete a product by ID
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/products/${id}`);
      return id; // Return the deleted product ID so we can remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

// Update a product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/products/${id}`, updatedData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.updatedProduct; // Return only the updated product object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

// Initial state
const initialState = {
  loading: false,
  products: [],
  error: null,
  message: null
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // removeProductFromState: (state, action) => {
    //   state.products = state.products.filter(product => product._id !== action.payload);
    // },
    updateProductInState: (state, action) => {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    resetProduct : (state ) => {
        state.products = [];
        state.message= null;
    },
    resetProductState : (state) => {
        state.loading = false;
        state.message = null;
        state.error = null;
    }
    },
    extraReducers: (builder) => {
    builder
      // Add Product
        .addCase(AddProduct.pending, (state) => {
        state.loading = true;
        })
        .addCase(AddProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload); // Add new product to list
        state.message = "Product Added Successfully";
      })
      .addCase(AddProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Products
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((product) => product._id !== action.payload);
        state.message = "Product Deleted Successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.message = "Product Updated Successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions and reducer
export const {  updateProductInState , resetProduct ,resetProductState} = productSlice.actions;
export default productSlice.reducer;
