import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import api from "utils/axiosintance";

export const addCategories = createAsyncThunk(
    "categories/add",
    async({ name , description} , {rejectWithValue}) => {
        try {
            const response = await api.post("/addCategory" , { name , description});
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
            state.data = action.payload;
        })
        .addCase(addCategories.rejected, (state ) => {
            state.loading = false;
        })
        .addCase(fetchCategories.pending, (state) => { state.loading = true; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
        ;
    }
})
export default categorySlice.reducer;