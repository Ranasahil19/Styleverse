import React, { useState, useEffect } from "react";
import {
  Container, Box, Typography, Avatar, TextField, Button, Divider, 
  Grid, Switch, FormControlLabel, Paper, IconButton
} from "@mui/material";
import { Lock, Notifications, Save, CloudUpload } from "@mui/icons-material";
import { useSelector } from "react-redux";
import CustomSnackbar from "./CustomSnackbar";
import api from "../utils/axiosintance";

const AccountSettings = () => {
  const seller = useSelector((state) => state.auth.seller);

  // Ensure default values for notifications and darkMode
  const [values, setValues] = useState({
    name: seller?.userName || "",
    email: seller?.email || "",
    password: "",
    newPassword: "",
    notifications: seller?.notifications ?? true,  // Default to true if undefined
    darkMode: seller?.darkMode ?? false,  // Default to false if undefined
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (seller) {
      setValues((prevValues) => ({
        ...prevValues,
        name: seller.userName || "",
        email: seller.email || "",
        notifications: seller.notifications ?? true,
        darkMode: seller.darkMode ?? false,
      }));

      if(seller.avatar) setAvatarPreview(`${process.env.REACT_APP_API_URL}${seller.avatar}`);
    }
  }, [seller]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues({ ...values, [name]: type === "checkbox" ? checked : value });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("userName", values.name);
    formData.append("email", values.email);
  
    if (values.password && values.newPassword) {
      formData.append("password", values.password);
      formData.append("newPassword", values.newPassword);
    }
    
    if (avatarFile) {
      formData.append("image", avatarFile);
    }
  
    try {
      const response = await api.put("/update-profile", formData);
  
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
  
      // Set the updated profile information
      setValues((prevValues) => ({
        ...prevValues,
        name: response.data.seller.userName,
        email: response.data.seller.email,
        notifications: response.data.seller.notifications ?? true,
        darkMode: response.data.seller.darkMode ?? false,
      }));
  
      // Update avatar preview immediately
      if (response.data.seller.avatar) {
        setAvatarPreview(`${process.env.REACT_APP_API_URL}${response.data.seller.avatar}`);
      }
  
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || "Profile update failed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
  


  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Account Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Left Section - Profile & Security */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
              <Avatar src={avatarPreview} sx={{ width: 120, height: 120, mx: "auto", mb: 2 }} />
              <IconButton component="label">
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                <CloudUpload color="primary" />
              </IconButton>
              <Typography variant="h6" sx={{ mt: 2 }}>Profile Information</Typography>
              <Divider sx={{ my: 2 }} />
              <TextField fullWidth label="User Name" name="name" value={values.name} onChange={handleChange} margin="normal" />
              <TextField fullWidth label="Email Address" name="email" value={values.email} onChange={handleChange} margin="normal" />
            </Paper>
          </Grid>

          {/* Right Section - Main Settings */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              {/* Security Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Lock sx={{ mr: 1 }} /> Security Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField fullWidth type="password" label="Current Password" name="password" value={values.password} onChange={handleChange} margin="normal" />
                <TextField fullWidth type="password" label="New Password" name="newPassword" value={values.newPassword} onChange={handleChange} margin="normal" />
              </Box>

              {/* Notifications Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Notifications sx={{ mr: 1 }} /> Notifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={<Switch checked={values.notifications} onChange={handleChange} name="notifications" />}
                  label="Enable Email Notifications"
                />
                <FormControlLabel
                  control={<Switch checked={values.darkMode} onChange={handleChange} name="darkMode" />}
                  label="Enable Dark Mode"
                />
              </Box>

              {/* Save Button */}
              <Box sx={{ textAlign: "right" }}>
                <Button variant="contained" startIcon={<Save />} color="success" onClick={handleProfileUpdate} size="large">
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar Notification */}
      <CustomSnackbar open={openSnackbar} onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} message={snackbarMessage} />
    </>
  );
};

export default AccountSettings;
