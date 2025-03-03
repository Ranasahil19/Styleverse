const Order = require("../models/order");
const Product = require("../models/productModel");
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
        const result =  await Order.aggregate([
          { $match : {"items.sellerId" : sellerId}},
          { $count : "totalOrders"}
        ]);

        return result.length > 0 ? result.totalOrders : 0;
      } catch (error) {
        console.error("Error fetching total orders by seller:", err);
        throw new Error("Error fetching total orders by seller");
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
