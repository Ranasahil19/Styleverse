const Cart = require("../../models/cart");

const cartRoom = (userId) => `cart:${userId}`;

const emitCartCountUpdated = async (userId) => {
  if (!userId || !global.io) {
    return;
  }

  const count = await Cart.countDocuments({ userId });

  global.io.to(cartRoom(userId.toString())).emit("cartCountUpdated", {
    userId: userId.toString(),
    count,
  });
};

module.exports = {
  cartRoom,
  emitCartCountUpdated,
};
