const Order = require("../models/order");
const Seller = require("../models/seller");

const resolvers = {
  Query: {
    // Get Total number of Orders
    totalOrders: async () => {
      try {
        return await Order.countDocuments();
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },

    // Get Total Revenue
    totalRevenue: async () => {
        try {
            const orders = await Order.find();
            return orders.reduce((total, order) => total + order.totalPrice, 0);
        } catch (err) {
            console.log(err);
            throw new Error(err.message);
        }
    },

    sellers: async () => {
        try {
          const sellers = await Seller.find({ role: 1}).lean();
  
          const sellersWithOrders = await Promise.all(
            sellers.map(async (seller) => {
              const orders = await Order.find({ "items.sellerId": seller._id });
  
              const filteredOrders = orders.map((order) => {
                const sellerItems = order.items.filter(
                  (item) => item.sellerId.toString() === seller._id.toString()
                );
                
                console.log(sellerItems);
  
                const sellerTotalPrice = sellerItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
  
  
                console.log(sellerTotalPrice);
  
                return {
                  _id: order._id,
                  totalPrice: sellerTotalPrice,
                  createdAt: order.createdAt,
                };
              });
  
              console.log(filteredOrders);
  
              const totalSales = filteredOrders.reduce(
                (sum, order) => sum + order.totalPrice,
                0
              );
  
              return {
                ...seller,
                orders: filteredOrders,
                totalSales, // Ensure this is included
              };
            })
          );
  
          return sellersWithOrders;
        } catch (error) {
          console.error("Error fetching sellers:", error);
          throw new Error("Error fetching sellers");
        }
      },
  },
};

module.exports = resolvers;
