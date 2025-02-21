import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import api from "utils/axiosintance";

export const addCategories = createAsyncThunk(
    "categories/add",
    async(category , {rejectWithValue}) => {
        try {
            const response = await api.post("/api/categories" ,category);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
)

export const fetchCategories = createAsyncThunk (
    "categories/fetch",
    async () => {
        const response = await api.get("/api/category");
        return response.data;
    }
)

export const deleteCategories = createAsyncThunk(
    "categories/delete",
    async(id) => {
        await api.delete(`/api/categories/${id}`)
        return id;
    }
)

const categorySlice = createSlice ({
    name: "categories",
    initialState: {data:[], loading : false},
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addCase(addCategories.pending, (state) => {
            state.loading = true;
        })
        .addCase(addCategories.fulfilled, (state , action) => {
            state.loading = false;
            state.data.push(action.payload);
        })
        .addCase(addCategories.rejected, (state ) => {
            state.loading = false;
        })
        .addCase(fetchCategories.pending, (state) => { state.loading = true; })
        .addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        .addCase(deleteCategories.pending, (state) => {
            state.loading = true;
        })
        .addCase(deleteCategories.fulfilled, (state , action) => {
            state.loading = false;
            state.data = state.data.filter((category) => category._id !== action.payload)
        })
    }
})
export default categorySlice.reducer;