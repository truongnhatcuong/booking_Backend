import {
  createBlogRepo,
  getBlogEmployeeRepo,
  getBlogRepo,
  publishedBlogRepo,
} from "../repositories/blog.repo.js";

export async function getBlogService() {
  const blog = await getBlogRepo();
  return blog;
}

export async function getBlogEmployeeService() {
  const blog = await getBlogEmployeeRepo();
  return blog;
}

export async function createBlogService({
  title,
  summary,
  content,
  coverImage,
  employeeId,
}) {
  console.log("service", {
    title,
    summary,
    content,
    coverImage,
    employeeId,
  });

  const createBlog = await createBlogRepo({
    title,
    summary,
    content,
    coverImage,
    employeeId,
  });
  return createBlog;
}

export async function publishedBlogService(id) {
  const publishedBlog = await publishedBlogRepo(id);
  return publishedBlog;
}
