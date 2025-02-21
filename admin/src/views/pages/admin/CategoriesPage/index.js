import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from 'features/categorySlice';
import { Box, List, ListItem, ListItemText, Grid , Typography, IconButton, Button, useTheme, useMediaQuery, Dialog, DialogContent, DialogTitle, TextField, DialogActions } from "@mui/material";
import { Add, Print, Delete, ModeEdit } from '@mui/icons-material';
import CustomSnackbar from 'component/CustomSnackbar';
import { useState } from 'react';

const CategoriesList = () => {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.categories.data);  // Get categories from Redux store
    const [openDialog , setOpenDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        dispatch(fetchCategories());  // Fetch categories on mount
    }, [dispatch]);

    const handleDelete = (id) => {
        console.log("Delete category with ID:", id);
        // Dispatch delete action here if needed
    };

    return (    
        <>
        <Box sx={{ maxWidth: "auto", mx: "auto", p: 2 }}>
            
            {/* Header with Add & Print Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <IconButton sx={{ color: '#333', '&:hover': { color: '#444' } }} onClick={() => console.log("Print Categories")}>
                    <Print />
                </IconButton>
                <Button
                    variant="contained"
                    sx={{ backgroundColor: '#333', color: 'white', '&:hover': { backgroundColor: '#444' } }}
                    onClick={() => setOpenDialog(true)}
                >
                    <Add /> {isMobile ? '' : 'Add Category'}
                </Button>
            </Box>

            {/* Categories List */}
            <List sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 2, p: 1 }}>
        {categories.length > 0 ? (
            categories.map((category, index) => (
                <ListItem key={category._id} divider>
                    {/* Grid for better alignment */}
                    <Grid container alignItems="center">
                        
                        {/* Index Number */}
                        <Grid item xs={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                                {index + 1}.
                            </Typography>
                        </Grid>

                        {/* Category Name & Description */}
                        <Grid item xs={8}>
                            <ListItemText
                                primary={category.name}
                                secondary={`Description: ${category.description}`}
                            />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={3} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <IconButton edge="end" color="success" onClick={() => handleEdit(category._id)}>
                            <ModeEdit />
                        </IconButton>
                        <IconButton edge="end" color="error" onClick={() => handleDelete(category._id)}>
                            <Delete />
                        </IconButton>
                    </Grid>

                    </Grid>
                </ListItem>
                ))
            ) : (
                <ListItem>
                    <ListItemText primary="No categories available" />
                </ListItem>
            )}
        </List>;

        </Box>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}  maxWidth="sm" fullWidth sx={{ width: isMobile ? "auto":"450px", mx: "auto" }}>
            <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: 15 }}>
                Add Categories
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{display: "grid" , gap : 1.5}}>
                    <TextField label="name" name='name' ></TextField>
                    <TextField label="description" name='discription' ></TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => console.log("data inserted")} variant="contained" color="primary"> Add </Button>
            </DialogActions>
        </Dialog>
        <CustomSnackbar />
        </>
    );
};

export default CategoriesList;
