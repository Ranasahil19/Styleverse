import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import customizationReducer from "./customizationReducer";
import registrationReducer from "../features/registerSlice";
import authReducer from "../features/authSlice";
import productReducer from "../features/productSlice";
import categoriesReducer from "features/categorySlice";
import sellerReducer from "features/sellerSlice";
import orderReducer from "../features/orderSlice";

const getRootReducer = () => combineReducers({
  customization: customizationReducer,
  register: registrationReducer,
  auth: authReducer,
  products: productReducer,
  categories: categoriesReducer,
  seller : sellerReducer,
  orders: orderReducer,

//   seller: sellerReducer
});

const persistConfig = {
  key: "root", // You can change this to any key you prefer
  storage,
  whitelist: ["auth", "products", "categories"], // Add "products" and "categories" here
};

const persistedReducer = persistReducer(persistConfig, getRootReducer());

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };