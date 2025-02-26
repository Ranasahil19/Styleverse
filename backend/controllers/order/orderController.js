const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Order = require("../../models/order"); // Adjust the path to your Order model
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const Product = require("../../models/productModel");
const Seller = require("../../models/seller")

const generateInvoicePDF = async (orderId, order, filePath) => {
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const address = order.userId.address
    ? `
      ${order.userId.address.address || "N/A"},
      ${order.userId.address.city || "N/A"},
      ${order.userId.address.state || "N/A"},
      ${order.userId.address.pincode || "N/A"},
      ${order.userId.address.country || "N/A"},
      Phone: ${order.userId.address.mobileno || "N/A"}
    `.replace(/\s+/g, " ").trim()
    : "Address not available";

  // Header Section
  doc.fontSize(20).text("Your Company Name", 110, 50);
  doc.fontSize(10).text("Your Company Address", 110, 70);
  doc.fontSize(12).text("Invoice", { align: "center" }).moveDown();

  // Invoice Details
  doc.text(`Invoice Number: ${order._id}`, 50, 180);
  doc.text(`Address:`, 300, 200).text(address, { width: 250, align: "left" });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 200);
  doc.text(`Total: $${order.totalPrice.toFixed(2)}`, 50, 220);

  doc.text(`Billed To: ${order.userId.username}`, 300, 180);
  doc.moveDown();

  const tableTop = 260;
  doc.fontSize(10).text("S.No", 50, tableTop)
    .text("Title", 100, tableTop)
    .text("Description", 200, tableTop)
    .text("Quantity", 350, tableTop)
    .text("Unit Price", 450, tableTop)
    .text("Total", 520, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(570, tableTop + 15).stroke();

  // Table Rows
  let currentY = tableTop + 30;
  let serialNumber = 1;

  order.items.forEach((item) => {
    const title = item.title || "N/A";
    const description = item.productId?.description || "-";
    const titleWidth = 90;
    const descriptionWidth = 140;
    const rowHeight = 20;

    // Wrap text for title and description
    const wrappedTitle = doc.heightOfString(title, { width: titleWidth, align: "left" });
    const wrappedDescription = doc.heightOfString(description, { width: descriptionWidth, align: "left" });
    const dynamicHeight = Math.max(rowHeight, wrappedTitle, wrappedDescription);

    // Check for page overflow
    if (currentY + dynamicHeight > 750) {
      doc.addPage();
      currentY = 50; // Reset to top of the new page

      // Re-add table headers
      const newTableTop = currentY;
      doc.fontSize(10).text("S.No", 50, newTableTop)
        .text("Title", 100, newTableTop)
        .text("Description", 200, newTableTop)
        .text("Quantity", 350, newTableTop)
        .text("Unit Price", 450, newTableTop)
        .text("Total", 520, newTableTop);

      doc.moveTo(50, newTableTop + 15).lineTo(570, newTableTop + 15).stroke();
      currentY = newTableTop + 30;
    }

    // Draw the table row
    doc.fontSize(10)
      .text(serialNumber, 50, currentY)
      .text(title, 100, currentY, { width: titleWidth })
      .text(description, 200, currentY, { width: descriptionWidth })
      .text(item.quantity.toString(), 350, currentY)
      .text(`$${item.price.toFixed(2)}`, 450, currentY)
      .text(`$${(item.price * item.quantity).toFixed(2)}`, 520, currentY);

    currentY += dynamicHeight + 10; // Add extra space between rows
    serialNumber++;
  });

  // Footer Section
  doc.moveTo(50, currentY).lineTo(570, currentY).stroke();
  currentY += 20;

  doc.fontSize(12).text("Thank you for your order!", 50, currentY, { align: "center" })
    .text("We hope to serve you again soon.", { align: "center" });

  doc.end();
  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
  });
};

exports.sendInvoiceEmail = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch the order details by orderId
    const order = await Order.findById(orderId)
      .populate("items.productId", "description")
      .populate("userId", "email username address");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const invoicesDir = path.join(__dirname, "../../invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    const filePath = path.join(invoicesDir, `invoice-${orderId}.pdf`);

    // Generate the PDF invoice
    await generateInvoicePDF(orderId, order, filePath);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.userId.email,
      subject: `Invoice for Order ${order._id}`,
      text: `Dear ${order.userId.username},\n\nPlease find your invoice for order ${order._id} attached.\n\nThank you!`,
      attachments: [
        {
          filename: `invoice-${orderId}.pdf`,
          path: filePath,
        },
      ],
    };

    // Send the email with the invoice attachment
    try {
      await transporter.sendMail(mailOptions);
      console.log("Invoice email sent successfully!");
      res.status(200).json({ message: "Invoice sent to email!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Error sending email" });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch the order details by orderId
    const order = await Order.findById(orderId)
      .populate("items.productId", "description")
      .populate("userId", "username address firstname lastname");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const invoicesDir = path.join(__dirname, "../../invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    const filePath = path.join(invoicesDir, `invoice-${orderId}.pdf`);

    // Generate the PDF invoice
    await generateInvoicePDF(orderId, order, filePath);

    // Provide the generated invoice for download
    res.download(filePath, `invoice-${orderId}.pdf`, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error downloading the invoice." });
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.placeOrder = async (orderDetails) => {
  const { userId, cartItems, totalPrice, shippingAddress, paymentId } = orderDetails;

  try {
    if (!userId || !cartItems || !cartItems.length || !totalPrice) {
      throw new Error("Missing required fields for order.");
    }

    // Reduce product count (quantity)
    for (const item of cartItems) {
      const product = await Product.findOne({ _id: item.productId });

      if (!product) {
        throw new Error(`Product not found: ${item.title}`);
      }

      // Check if stock (rating.count) is available
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.title}`);
      }

      // Reduce stock in rating.count
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      })),
      totalPrice,
      paymentId,
      shippingAddress,
      status: "Pending",
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Estimated delivery
    });

    // Generate the orderId before saving
    order.orderId = order._id.toString();
    
    const savedOrder = await order.save();
    console.log("Order placed successfully, product count updated:", savedOrder);
    
    // Track sellers who have been updated to avoid duplication
    const updatedSellers = new Set();

    // Now add the order to the respective seller's orders list
    for (const item of cartItems) {
      const seller = await Seller.findOne({ sellerId: item.sellerId });
      if (seller && !updatedSellers.has(seller._id.toString())) {
        seller.orders.push(savedOrder._id); // Add the order ID to the seller's orders array
        await seller.save(); // Save the updated seller document
        updatedSellers.add(seller._id.toString()); // Mark this seller as updated
        console.log(`Added order to seller ${seller.username}`);
      }
    }

    return savedOrder;
  } catch (error) {
    console.error("Error placing order:", error.message);
    throw new Error("Failed to place order");
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const { sellerId } = req.query;
    let query = {}; // Initialize query object

    if (sellerId) {
      query["items.sellerId"] = sellerId; // Filter orders by sellerId
    }

    const orders = await Order.find(query)
      .populate({
        path: "items.sellerId",
        select: "name",
      })
      .populate({
        path: "paymentId",
        select: "cardHolderName",
      })
      .lean()
      .exec();

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Server Error");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (
      !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: orderId  },
      { status: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order status updated successfully!", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error });
  }
};

// Get Order By UserId
exports.getOrderByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).populate("items.productId");
    if (!orders || orders.length === 0) {
      return res.status(404).send({ message: "Orders not found" });
    }
    res.send(orders);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send({ error: "Server error" });
  }
};

exports.getOrderData = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const userId = req.params.userId;
    const order = await Order.findOne({ userId }).sort({ createdAt: -1 }); // Get the latest order

    if (!order) {
      return res.status(404).json({ message: "No order found" });
    }

    res.status(200).json(order); // Return the order details
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};
