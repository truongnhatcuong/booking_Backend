import { blogPostSchema, blogPostSchemaUpdate } from "../schemas/BlogSchema.js";
import {
  createBlogService,
  deleteBlogService,
  getBlogEmployeeService,
  getBlogService,
  getBlogToSlugService,
  publishedBlogService,
  updateBlogService,
} from "../services/blog.service.js";

export async function getBlog(req, res) {
  try {
    const { page, limit } = req.query;

    const getBlog = await getBlogService({ page, limit });
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
  const { page, limit, search, published } = req.query;

  try {
    const result = await getBlogEmployeeService(
      Number(page) || 1,
      Number(limit) || 10,
      search,
      published,
    );
    return res.status(200).json({ ...result, message: "Thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

export async function deletedBlog(req, res) {
  const { id } = req.params;

  try {
    const data = await deleteBlogService(id);
    return res
      .status(200)
      .json({ data, message: "bạn đã xóa thành công bài viết này " });
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function updateBlog(req, res) {
  const { id } = req.params;
  try {
    const parsed = blogPostSchemaUpdate.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const data = await updateBlogService(id, parsed.data);
    return res.status(200).json({ data, message: "updated success" });
  } catch (error) {
    return res.status(400).json(error);
  }
}
