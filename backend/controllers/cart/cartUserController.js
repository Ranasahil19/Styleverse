const Cart = require("../../models/cart");

// Fetch all cart items for a specific user
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId.length !== 24) {
      return res.status(400).json({ message: "Invalid or missing user ID." });
    }

    const cartItems = await Cart.find({ userId }).populate("productId");
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found." });
    }

    const formattedItems = cartItems.map((item) => ({
      _id: item._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      color: item.productId.color,
      badge: item.productId.badge,
      quantity: item.quantity,
      addedAt: item.addedAt,
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Failed to fetch cart items" });
  }
};


// Remove a cart item

exports.removeCart = async (req, res) => {
  const { cartItemId } = req.params;

  if (!cartItemId) {
    return res.status(400).json({ message: "Cart ID is required" });
  }

  try {
    // Find and delete the cart item
    const deletedItem = await Cart.findByIdAndDelete(cartItemId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ success: true, message: "Cart item deleted" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear all cart items
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Clear the cart items from the database
    await Cart.deleteMany({ userId });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing the cart" });
  }
};
