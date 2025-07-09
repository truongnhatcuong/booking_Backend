import Express from "express";
import {
  createBlog,
  getBlog,
  getBlogEmployee,
  publishedBlog,
  getBlogToSlug,
} from "../controller/blog.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const blogRoute = Express.Router();

blogRoute.get("/", getBlog);
blogRoute.get("/employee", getBlogEmployee);
blogRoute.get("/:slug", getBlogToSlug);
blogRoute.post("/", authEmployee, createBlog);
blogRoute.put("/:id", publishedBlog);

export default blogRoute;
