import express from "express";
import cors from "cors";
import "dotenv/config";
import routerUser from "./router/userRoute.js";
import cookieParser from "cookie-parser";
import employeeRouter from "./router/employeeRouter.js";

const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // domain FE của bạn
    credentials: true, // cho phép gửi cookies
  })
);
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json("server running.....").status(200);
});
app.use("/api/auth", routerUser, employeeRouter);

app.listen(port, () => {
  console.log("server started run :" + port);
});
