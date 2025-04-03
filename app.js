const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/userRouter");
const orderRouter = require("./routes/orderRouter");
const tailorRouter = require("./routes/tailorRouter");
const clothRouter = require("./routes/clothRouter");
const flash = require("connect-flash");
const expressSession = require("express-session");
const indexRouter = require("./routes/index");
const db = require("./config/mongoose-connection");
require("dotenv").config(); // With this I can access all the variables present in the env file.

app.use(express.json());
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

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);
app.use("/cloths", clothRouter);
app.use("/tailors", tailorRouter);

app.listen(5000);
