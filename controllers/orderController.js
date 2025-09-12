const Order = require("../models/Order");
const User = require("../models/User");

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

    await User.findByIdAndUpdate(userId, {
      $push: { orders: order._id },
      $set: { cart: [] },
    });

    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    res.status(500).json({ message: "Order placement failed" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product",
      "name price"
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryStatus !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be deleted" });
    }

    await Order.findByIdAndDelete(orderId);

    await User.findByIdAndUpdate(userId, {
      $pull: { orders: orderId },
    });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};

exports.getTopCloths = async (req, res) => {
  try {
    const topCloths = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cloths",
          localField: "_id",
          foreignField: "_id",
          as: "clothDetails",
        },
      },
      { $unwind: "$clothDetails" },
      {
        $project: {
          _id: 0,
          clothId: "$clothDetails._id",
          name: "$clothDetails.name",
          type: "$clothDetails.type",
          tailor: "$clothDetails.tailor",
          price: "$clothDetails.price",
          image: "$clothDetails.image",
          orderedCount: "$count",
        },
      },
    ]);

    res.status(200).json(topCloths);
  } catch (error) {
    console.error("Error fetching top cloths:", error);
    res.status(500).json({ message: "Failed to fetch top cloths" });
  }
};
