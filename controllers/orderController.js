const Order= require("../models/Order");
const User= require("../models/User");


exports.placeOrder = async (req, res) => {
  const { items, address, paymentMode, totalAmount } = req.body;
  const userId = req.user.id;

  try {
    const order = await Order.create({
      user: userId,
      items,
      address,
      paymentMode,
      totalAmount,
    });

    // Optional: Add order to user's order history and clear cart
    await User.findByIdAndUpdate(userId, {
      $push: { orders: order._id },
      $set: { cart: [] },
    });

    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Order placement failed" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};