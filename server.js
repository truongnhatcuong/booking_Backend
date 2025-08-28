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
import http from "http";
import jwt from "jsonwebtoken";
import { Server as SocketServer } from "socket.io";
import cookie from "cookie";

const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.use("/api/chatai", routerOpenAi);

// phần socket
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

io.use((socket, next) => {
  const rawCookie = socket.request.headers.cookie || "";
  const cookies = cookie.parse(rawCookie); // tách cookie thành object
  const token = cookies.token; // lấy token từ key "token"

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      // Nếu role là Lễ Tân hoặc Quản Lý thì đều là EMPLOYEE
      socket.role = ["Lễ Tân", "Quản Lý"].includes(decoded.role)
        ? "EMPLOYEE"
        : "CUSTOMER";
    } catch (err) {
      return next(new Error("Invalid token", err));
    }
  } else {
    const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    socket.userId = guestId;
    socket.role = "CUSTOMER";
  }
  next();
});
let onlineEmployees = new Set();
let waitingCustomers = new Set();
let assignedChats = new Map();
// Sự kiện socket
io.on("connection", (socket) => {
  console.log("Người dùng kết nối:", socket.userId);

  // Join room bằng userId để nhận tin nhắn cá nhân
  socket.join(socket.userId.toString());

  console.log("userId:", socket.userId, "role:", socket.role);

  const payload = { userId: socket.userId, role: socket.role };

  socket.emit("user_info", payload);

  socket.on("release_customer", (customerId) => {
    assignedChats.delete(customerId);
    waitingCustomers.add(customerId); // nếu muốn khách trở lại hàng chờ
  });

  if (socket.role === "EMPLOYEE") {
    onlineEmployees.add(socket.userId);
    io.emit("online_employees", Array.from(onlineEmployees));
  } else {
    // khách hàng nhận danh sách nhân viên online
    socket.emit("online_employees", Array.from(onlineEmployees));
  }
  // Chat 1-1
  socket.on("send_message", ({ receiverId, content }) => {
    const senderId = socket.userId;
    let targetId = receiverId;

    if (socket.role === "CUSTOMER" && !receiverId) {
      const assignedEmp = assignedChats.get(senderId);

      if (assignedEmp) {
        targetId = assignedEmp;
      } else {
        socket.emit("receive_message", {
          senderId: "BOT",
          receiverId: senderId,
          content: "Xin chào! Chúng tôi sẽ kết nối bạn với nhân viên ngay...",
        });

        if (socket.role === "CUSTOMER") {
          waitingCustomers.add(senderId);
          const onlyCustomers = Array.from(waitingCustomers).filter(
            (id) => !onlineEmployees.has(id)
          );
          // 2. Báo cho tất cả nhân viên online rằng có khách mới
          onlineEmployees.forEach((empId) => {
            io.to(empId).emit("waiting_customers", onlyCustomers);
          });
          return;
        }
      }
      if (!targetId) return; // <- tránh gửi undefined
    }
    const message = { senderId, receiverId: targetId, content };

    io.to(targetId).emit("receive_message", message);
    // gửi lại cho chính user để hiển thị tin nhắn đã gửi
    socket.emit("receive_message", message);

    if (socket.role === "CUSTOMER") {
      io.to(receiverId).emit("new_customer_chat", socket.userId);
    }
  });
  // nhận khách hàng
  socket.on("accept_customer", (customerId) => {
    if (socket.role !== "EMPLOYEE") return;

    // Gán khách cho nhân viên này
    assignedChats.set(customerId, socket.userId);
    waitingCustomers.delete(customerId);

    // Cập nhật danh sách khách chờ cho tất cả nhân viên
    const onlyCustomers = Array.from(waitingCustomers).filter(
      (id) => !onlineEmployees.has(id)
    );
    io.emit("waiting_customers", onlyCustomers);
    // Thông báo cho cả khách và nhân viên
    io.to(customerId).emit("chat_assigned", { employeeId: socket.userId });
    io.to(socket.userId).emit("chat_assigned", { customerId });
  });

  socket.on("disconnect", () => {
    console.log("Ngắt kết nối:", socket.userId);
    if (socket.role === "EMPLOYEE") {
      onlineEmployees.delete(socket.userId);
      io.emit("online_employees", Array.from(onlineEmployees));
    }
    waitingCustomers.delete(socket.userId); // nếu là khách thì xoá khỏi waiting
  });
});

server.listen(port, () => {
  console.log(
    `Server + Socket.IO chạy ${process.env.FRONTEND_URL} tại cổng: ${port}`
  );
});

export default app;
