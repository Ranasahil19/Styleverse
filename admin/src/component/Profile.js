import React from "react";
import { Card, CardContent, CardMedia, Avatar, Typography, Box, Button, Grid, IconButton } from "@mui/material";
import { Edit, Email, LocationOn, LinkedIn, Twitter, Instagram } from "@mui/icons-material";

const UserProfile = () => {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Card sx={{ maxWidth: 600, width: "100%", borderRadius: 3, boxShadow: 3 }}>
            {/* Cover Image */}
            <CardMedia
            component="img"
            height="150"
            image="https://source.unsplash.com/random/800x200?nature"
            alt="cover"
            />

            {/* Avatar & Profile Details */}
            <CardContent sx={{ textAlign: "center", position: "relative", mt: -7 }}>
            <Avatar
                src="https://source.unsplash.com/random/100x100?person"
                sx={{
                width: 100,
                height: 100,
                border: "4px solid white",
                mx: "auto",
                }}
            />
            <Typography variant="h5" fontWeight="bold" mt={1}>
                John Doe
            </Typography>
            <Typography variant="body2" color="textSecondary">
                UI/UX Designer | Frontend Developer
            </Typography>

            {/* Location & Email */}
            <Grid container spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                <Grid item sx={{ display: "flex", alignItems: "center" }}>
                <LocationOn fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                <Typography variant="body2">New York, USA</Typography>
                </Grid>
                <Grid item sx={{ display: "flex", alignItems: "center" }}>
                <Email fontSize="small" sx={{ color: "gray", mr: 0.5 }} />
                <Typography variant="body2">john.doe@email.com</Typography>
                </Grid>
            </Grid>

            {/* Social Icons */}
            <Box sx={{ mt: 2 }}>
                <IconButton color="primary">
                <LinkedIn />
                </IconButton>
                <IconButton color="secondary">
                <Twitter />
                </IconButton>
                <IconButton sx={{ color: "#E1306C" }}>
                <Instagram />
                </IconButton>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                Follow
                </Button>
                <Button variant="outlined" startIcon={<Edit />}>
                Edit Profile
                </Button>
            </Box>
            </CardContent>
        </Card>
        </Box>
    );
};

export default UserProfile;
