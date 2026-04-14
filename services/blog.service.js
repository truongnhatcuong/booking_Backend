import {
  createBlogRepo,
  deleteBlogRepo,
  getBlogEmployeeRepo,
  getBlogRepo,
  getBlogToSlugRepo,
  publishedBlogRepo,
  totalBlogRepo,
  updateBlogRepo,
} from "../repositories/blog.repo.js";
import redisClient from "../repositories/redisClient.js";

export async function getBlogService({ page = 1, limit = 10 }) {
  const safePage = Math.max(Number(page) || 1, 1); // Đảm bảo page >= 1
  const safeLimit = Math.max(Number(limit) || 10, 1); // Đảm bảo limit >= 1

  const skip = (safePage - 1) * safeLimit;

  try {
    const [blogData, total] = await Promise.all([
      getBlogRepo({ skip, limit: safeLimit }), // Lấy dữ liệu blog
      totalBlogRepo(), // Đếm tổng số blog
    ]);

    return {
      data: blogData,
      total,
      limit: safeLimit,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    throw new Error("Failed to fetch blog data");
  }
}
export async function getBlogToSlugService(slug) {
  const blogToSlug = await getBlogToSlugRepo(slug);
  const cacheKey = `blog:slug:${slug}`;
  const cacheData = await redisClient.get(cacheKey);
  if (cacheData) {
    console.log("🚀 [REDIS]: Lấy từ Cache Cloud");
    return JSON.parse(cacheData);
  }
  if (!blogToSlug) {
    throw new Error("Không tìm thấy bài viết với slug này.");
  }
  try {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(blogToSlug));
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu từ Redis:", error);
  }
  return blogToSlug;
}

export async function getBlogEmployeeService(
  page = 1,
  limit = 10,
  search,
  published,
) {
  const { blogs, total } = await getBlogEmployeeRepo(
    page,
    limit,
    search,
    published,
  );

  return {
    blogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

export async function deleteBlogService(id) {
  const deletedBlog = await deleteBlogRepo(id);
  return deletedBlog;
}

export async function updateBlogService(id, data) {
  const updateBlog = await updateBlogRepo(id, data);
  return updateBlog;
}
