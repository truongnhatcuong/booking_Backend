import { prisma } from "../lib/client.js";

export async function getBlogRepo() {
  const blog = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      coverImage: true,
      slug: true,
      title: true,
      summary: true,
      publishedAt: true,
    },
  });
  return blog;
}

export async function getBlogToSlugRepo(slug) {
  const blog = await prisma.blogPost.findUnique({
    where: {
      slug,
      published: true,
    },
  });
  return blog;
}

export async function getBlogEmployeeRepo() {
  const blog = await prisma.blogPost.findMany({
    include: {
      employee: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
  return blog;
}

export async function createBlogRepo({
  title,
  summary,
  content,
  coverImage,
  employeeId,
}) {
  function generateSlug(title) {
    if (typeof title !== "string") {
      throw new Error("Title must be a string");
    }
    return title
      .toLowerCase() // Chuyển thành chữ thường
      .normalize("NFD") // Tách dấu (nếu có dấu tiếng Việt)
      .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
      .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
      .trim() // Xóa khoảng trắng đầu/cuối
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu -
  }
  console.log();

  const createBlog = await prisma.blogPost.create({
    data: {
      title,
      slug: generateSlug(title),
      summary,
      content,
      coverImage,
      employeeId,
    },
  });
  return createBlog;
}

export async function publishedBlogRepo(id) {
  const findBlog = await prisma.blogPost.findUnique({
    where: {
      id,
    },
  });
  let newpublished = !findBlog.published;

  return await prisma.blogPost.update({
    where: {
      id,
    },
    data: {
      published: newpublished,
      publishedAt: newpublished ? new Date() : null,
    },
  });
}
