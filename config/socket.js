const Chat = require("../models/Chat");

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userId = String(socket.handshake.auth.userId || socket.handshake.query.userId);


    if (!userId) {
      console.error("❌ No user found on socket connection.");
      return socket.disconnect(true);
    }

    console.log("✅ User connected:", userId);

    // Join user-specific room
    socket.join(userId);

    // Handle new message
    socket.on("sendMessage", async ({ receiver, message }) => {
      try {
        if (!receiver || !message) {
          return console.warn("⚠️ Incomplete message payload received");
        }

        const newMessage = new Chat({
          sender: userId,
          receiver,
          message,
        });

        const savedMessage = await newMessage.save();

        const populatedMessage = await Chat.populate(savedMessage, [
          { path: "sender", select: "name email profileImage" },
          { path: "receiver", select: "name email profileImage" },
        ]);

        console.log("📤 Sending message from:", userId, "to:", receiver);

        io.to(userId).to(String(receiver)).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("❌ Error sending message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", userId);
    });
  });
};
