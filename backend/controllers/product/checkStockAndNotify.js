const Product = require("../../models/productModel")
const io = global.io

const checkStockAndNotify = async (productId , sellerId) => {
    try {
        const product = await Product.findById(productId)

        if(product.quantity <= 5){
            const notification = new Notification({
                receiverId: sellerId, // Notify the seller
                message: `⚠️ Item '${product.name}' is running low on stock!`,
                type: "low_stock",
            });

            await notification.save();

            io.to(sellerId.toString()).emit("receiveNotification", {
                receiverId : sellerId.toString(),
                message,
                type: "low_stock",
            })
        }
    } catch (error) {
        console.error("Error checking stock:", error);
    }
}

module.exports = {
    checkStockAndNotify
}