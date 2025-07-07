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

const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["set-cookie"], // Quan trọng cho FE nhận cookie
  })
);

app.use(cookieParser());
// app.get("/", (req, res) => {
//   res.json("server running.....").status(200);
// });
app.get("/", (req, res) => {
  res.status(200).json("server running.....");
});
app.use("/api/auth", routerUser, employeeRouter);
app.use("/api/amenity", amenityRouter);
app.use("/api/roomtype", routerRoomtype);
app.use("/api/room", routerRoom);
app.use("/api/booking", RouterBooking);
app.use("/api/payment", routerPayment);
app.use("/api/discount", disCoutRouter);
app.use("/api/review", routerReview);
app.use("/api/maintenance", routerMaintenance);
app.use("/api/role", routerRoleEmployee);
app.use("/api", dashboardRouter);
app.use("/api/blog", blogRoute);
app.listen(port, () => {
  console.log("server started run :" + port);
});
export default app;
