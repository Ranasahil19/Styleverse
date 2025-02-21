import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "utils/axiosintance";

// Add a new product
export const AddProduct = createAsyncThunk(
    "products/addProduct",
    async (newProduct, { rejectWithValue }) => {
        try {
            const response = await api.post("/api/products", newProduct);
            return response.data; // API should return the new product
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
            if(!sellerId) return;

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
        resetProductState: (state) => {
            state.error = null;
            state.message = null;
            state.products = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Add Product
            .addCase(AddProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(AddProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload.product); // Add new product to list
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
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter((product) => product._id !== action.payload); // Remove deleted product
                state.message = "Product Deleted Successfully";
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex((product) => product._id === action.payload.updatedProduct?._id);
                if (index !== -1) {
                    state.products[index] = action.payload.updatedProduct;
                }
                state.message = "Product Updated Successfully";
            });
            
    }
});

// Export actions and reducer
export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;
