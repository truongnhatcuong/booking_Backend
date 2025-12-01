import Express from "express";
import {
  createBlog,
  getBlog,
  getBlogEmployee,
  publishedBlog,
  getBlogToSlug,
  deletedBlog,
  updateBlog,
} from "../controller/blog.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const blogRoute = Express.Router();

blogRoute.get("/", getBlog);
blogRoute.get("/employee", getBlogEmployee);
blogRoute.get("/:slug", getBlogToSlug);
blogRoute.post("/", authEmployee, createBlog);
blogRoute.put("/:id", authEmployee, publishedBlog);
blogRoute.put("/update/:id", authEmployee, updateBlog);
blogRoute.delete("/:id", authEmployee, deletedBlog);
export default blogRoute;
