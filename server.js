import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import amenityRouter from "./api/Amenity.route.js";
import routerUser from "./api/user.route.js";
import employeeRouter from "./api/employee.route.js";
import routerRoomtype from "./api/roomType.route.js";
import routerRoom from "./api/room.route.js";
import RouterBooking from "./api/booking.route.js";
import routerPayment from "./api/payment.route.js";
import disCoutRouter from "./api/discount.route.js";
import routerReview from "./api/review.route.js";
import routerMaintenance from "./api/maintenance.route.js";
import routerRoleEmployee from "./api/RoleEmployee.route.js";
import dashboardRouter from "./api/statistical.route.js";
import blogRoute from "./api/blog.route.js";
import routerOpenAi from "./api/openAl.route.js";
import routerSeasonal from "./api/seasonal.route.js";
import session from "express-session";
import passport from "passport";
import GoogleRouter from "./api/google.routes.js";
import "./lib/passport.js";
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
const allowAccept = [
  "http://0.0.0.0:3000",
  "http://localhost:3000",
  "http://172.20.10.4:3000",
  "http://103.110.87.227",
  "http://103.110.87.227:4000",
  "https://cuongprofile.me",
  process.env.FRONTEND_URL,
];
app.use(
  cors({
    origin: allowAccept || process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.get("/", (req, res) => {
//   res.json("server running.....").status(200);
// });
app.get("/", async (req, res) => {
  res.status(200).json({ message: "server running....." });
});
app.use("/api/auth", routerUser, employeeRouter, GoogleRouter);
app.use("/api/amenity", amenityRouter);
app.use("/api/roomtype", routerRoomtype);
app.use("/api/room", routerRoom);
app.use("/api/booking", RouterBooking);
app.use("/api/payment", routerPayment);
app.use("/api/discount", disCoutRouter);
app.use("/api/review", routerReview);
app.use("/api/maintenance", routerMaintenance);
app.use("/api/role", routerRoleEmployee);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/blog", blogRoute);
app.use("/api/chatai", routerOpenAi);
app.use("/api/seasonal", routerSeasonal);

app.listen(port, () => {
  console.log(`Server ${process.env.FRONTEND_URL} tại cổng: ${port}`);
});

export default app;
