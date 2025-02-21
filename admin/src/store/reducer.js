
import { combineReducers } from '@reduxjs/toolkit';
// reducer import
import customizationReducer from './customizationReducer';
import registrationReducer from '../features/registerSlice'
import authReducer from '../features/authSlice'
import productReducer from '../features/productSlice'

// ==============================|| COMBINE REDUCER ||============================== //

const rootReducer = combineReducers({
  customization: customizationReducer,
  register : registrationReducer,
  auth : authReducer,
  products : productReducer
});

export default rootReducer;
