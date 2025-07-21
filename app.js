const express = require("express");
const cors = require("cors");  // Import cors
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/userRouter");
const orderRouter = require("./routes/orderRouter");
const tailorRouter = require("./routes/tailorRouter");
const clothRouter = require("./routes/clothRouter");
const customizeRouter = require("./routes/customizeRouter");
const measurementRouter=require("./routes/measurementRouter")
const flash = require("connect-flash");
const expressSession = require("express-session");
const chatRouter=require('./routes/chatRouter')
const indexRouter = require("./routes/index");
const db = require("./config/mongoose-connection");
require("dotenv").config();

app.use(cors({
  origin: "http://localhost:5173",  // Your React app's URL
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
  credentials: true,  // Allow cookies/credentials to be sent
}));

// Skip JSON parsing for GET and DELETE requests to avoid JSON parse errors
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "DELETE") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.use('/uploads', express.static('uploads'));
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);
app.use("/cloths", clothRouter);
app.use("/tailors", tailorRouter);
app.use("/custom",customizeRouter);
app.use("/measurements",measurementRouter);
app.use("/api/chat",chatRouter);



//Socket.io

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  },
});

const socketAuth = require("./middleware/socketAuth");
io.use(socketAuth);

const initSocket = require("./config/socket");
initSocket(io);

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
