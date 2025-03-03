const Order = require("../models/order");
const Product = require("../models/productModel");
const Seller = require("../models/seller");
const User = require("../models/user");

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

    //Get Total Products 
    totalProduct : async () => {
      try {
        return await Product.countDocuments();
      } catch (error) {
        console.log(error)
        throw new Error(error.message)
      }
    },

    //Get Total Products by Seller
    totalProductsBySeller : async (_, {sellerId}) => {
      try {
        return await Product.countDocuments({sellerId});
      } catch (error) {
        console.error("Error fetching total products by seller:", err);
        throw new Error("Error fetching total products by seller");
      }
    },

    //Get Total Orders by Seller
    totalOrdersBySeller : async (_, {sellerId}) => {
      try {
        const totalOrders = await Order.countDocuments({ "items.sellerId": sellerId });
        return totalOrders;
      } catch (error) {
        console.error("Error fetching total orders by seller:", error);
        throw new Error("Error fetching total orders by seller");
      }
    },

    // Get Total number of Users
    totalUsers: async () => {
      try {
        return await User.countDocuments();
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },

    // Get Total number of Sellers
    totalSellers: async () => {
      try {
        return await Seller.countDocuments();
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

    // Get Total Admin Income
    totalAdminIncome: async () => {
      try {
        // Get all orders
        const orders = await Order.find();
    
        // Fetch all sellers
        const sellers = await Seller.find().lean();
    
        // Calculate total earnings of all sellers dynamically
        let sellerTotalEarnings = 0;
    
        for (const seller of sellers) {
          const sellerOrders = await Order.find({ "items.sellerId": seller._id });
    
          // Calculate total sales for this seller
          const sellerTotal = sellerOrders.reduce((sum, order) => {
            const sellerItems = order.items.filter(item => item.sellerId.toString() === seller._id.toString());
            return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
          }, 0);
    
          sellerTotalEarnings += sellerTotal;
        }
    
        // Calculate total revenue from all orders
        const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);
    
        // Admin's income = Total Revenue - Sellers' earnings
        const adminIncome = totalRevenue - sellerTotalEarnings;
    
        console.log("Total Revenue:", totalRevenue);
        console.log("Seller Total Earnings:", sellerTotalEarnings);
        console.log("Total Admin Income:", adminIncome);
    
        return adminIncome;
      } catch (err) {
        console.error("Error calculating admin income:", err);
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
  
                const sellerTotalPrice = sellerItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
  
                return {
                  _id: order._id,
                  totalPrice: sellerTotalPrice,
                  createdAt: order.createdAt,
                };
              });
  
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
