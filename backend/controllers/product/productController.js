// /controllers/productController.js

const Product = require("../../models/productModel");
const productsData = require("../../data/productsData"); // Importing the sample product data
const mongoose = require("mongoose");
const Category = require("../../models/category");
const Seller = require("../../models/seller");
const csvtojson = require("csvtojson");
// const { uploadBase64ToCloudinary } = require("../../utils/cloudinary");

const addProduct = async (req, res) => {
  try {
    const { title, description, category, price, quantity, sellerId, badge } =
      req.body;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required!" });
    }

    // Ensure an image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }

    const imageUrl = req.file.path;
    // Find the last product to get the highest id
    const lastProduct = await Product.findOne().sort({ id: -1 });

    // Create new product
    const newProduct = new Product({
      id: lastProduct ? lastProduct.id + 1 : 1, // Generate a unique id if the last product doesn't exist
      title,
      price,
      description,
      category,
      image: imageUrl,
      quantity,
      badge,
      sellerId, // Save image URL
    });

    await newProduct.save();

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $push: { products: newProduct._id } }, // Push new product ID into seller's products array
      { new: true } // Return updated document
    );

    if (!updatedSeller) {
      return res.status(404).send({ message: "Seller not found" });
    }

    return res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error" });
    }
  }
};

// const isBase64Image = (str) => /^data:image\/[a-zA-Z]+;base64,/.test(str);

const uploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file" });
    }

    const csvBuffer = req.file.buffer.toString("utf-8");
    const productData = await csvtojson().fromString(csvBuffer);

    let products = [];

    for (const row of productData) {
      try {
        let imageUrl = row.imageUrl;

// <<<<<<< feature-branch-7
//         // if (isBase64Image(row.imageUrl)) {
//         //   // Upload Base64 image to Cloudinary
//         //   const uploadResult = await uploadBase64ToCloudinary(row.imageUrl);
//         //   imageUrl = uploadResult.secure_url;
//         // }

// =======
// >>>>>>> main
        const product = new Product({
          sellerId: req.seller._id,
          title: row.name,
          description: row.description,
          price: parseFloat(row.price),
          category: row.category,
          quantity: parseInt(row.quantity),
          image: imageUrl || null,
          badge: row.badge,
        });

        products.push(product);
      } catch (error) {
        console.error("Error processing row:", error);
      }
    }

    // Insert products into the database
    const insertedProducts = await Product.insertMany(products);
    const insertedProductIds = insertedProducts.map((product) => product._id);

    // Update seller's product list
    const updatedSeller = await Seller.findByIdAndUpdate(
      req.seller._id,
      { $push: { products: { $each: insertedProductIds } } },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(201).json({ message: "Products uploaded successfully", product: insertedProducts });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product by Id

const updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = { ...req.body };

    //     if (req.file) {
    //       updatedData.image = `${req.protocol}://${req.get("host")}/uploads/${
    //         req.file.filename
    //       }`;
    //     }

    if (updatedData.sellerId) {
      delete updatedData.sellerId;
    }

    if (req.file) {
      updatedData.image = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating product", details: error.message });
  }
};

// Delete Product by Id

const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).send("Product not found");
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
// Get All Products

// Function to insert multiple products
const insertProducts = async (req, res) => {
  try {
    await Product.insertMany(productsData); // Insert the sample data
    res.status(200).json({ message: "Products inserted successfully!" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error inserting products", error: err.message });
  }
};

// Fetch all products
const getAllProduct = async (req, res) => {
  const { category } = req.params;

  try {
    // Fetch products based on the category
    const products = await Product.find({ category: category });

    // Return the products as a response
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

const getFilters = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { sellerId, badge, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (sellerId) query.sellerId = sellerId;
    if (badge) query.badge = badge;
    if (category) query.category = category;
    if (minPrice && maxPrice) {
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    }

    const products = await Product.find(query).populate("sellerId", "name");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from the URL
    console.log("Received ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ID format");
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    const product = await Product.findOne({ _id: id }); // Query using ObjectId
    if (!product) {
      console.log("Product not found");
      return res.status(404).json({ error: "Product not found." });
    }

    console.log("Product fetched:", product);
    res.status(200).json(product); // Return the product in JSON format
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Export functions
module.exports = {
  insertProducts,
  uploadProducts,
  getAllProduct,
  getAllProducts,
  fetchProductById,
  getFilters,
  addProduct,
  updateProductById,
  deleteProductById,
};
