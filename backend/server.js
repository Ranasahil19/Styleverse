const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');  // Import the connectDB function
const bodyParser = require('body-parser');
const routes = require('./routes/indexRoutes');
const cookieParser = require("cookie-parser");
require('dotenv').config();


const app = express();

// Middlewares
const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));

app.use('/api/stripe-webhook', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB using connectDB function
connectDB();  // This will handle the MongoDB connection
// Serve static files from the 'assets' folder
// app.use(express.static(path.join(__dirname, 'assets', 'images')));

// Use product routes
app.use('/', routes);
app.use("/uploads", express.static("uploads"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));