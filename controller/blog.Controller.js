import { blogPostSchema } from "../schemas/BlogSchema.js";
import {
  createBlogService,
  getBlogEmployeeService,
  getBlogService,
  getBlogToSlugService,
  publishedBlogService,
} from "../services/blog.service.js";

export async function getBlog(req, res) {
  try {
    const getBlog = await getBlogService(req.body);
    return res.status(200).json(getBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function getBlogToSlug(req, res) {
  const { slug } = req.params;
  try {
    const BlogToSlug = await getBlogToSlugService(slug);
    return res.status(200).json(BlogToSlug);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function getBlogEmployee(req, res) {
  try {
    const getBlog = await getBlogEmployeeService(req.body);
    return res.status(200).json(getBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function createBlog(req, res) {
  const parsed = blogPostSchema.safeParse(req.body);

  const employeeId = req.user.employee.id;

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const mergedData = {
    ...parsed.data,
    employeeId,
  };
  console.log(mergedData);

  try {
    const data = await createBlogService(mergedData);
    return res.status(201).json(data);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
}

export async function publishedBlog(req, res) {
  const { id } = req.params;
  try {
    const data = await publishedBlogService(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json(error);
  }
}
