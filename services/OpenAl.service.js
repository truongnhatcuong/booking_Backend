import OpenAI from "openai";
import { prisma } from "../lib/client.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_2,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "My Chat App",
  },
});

// Lấy phòng trống từ DB
async function getRoom() {
  const rooms = await prisma.room.findMany({
    where: { status: "AVAILABLE" },
    select: {
      roomNumber: true,
      images: true,
      status: true,
      roomType: {
        select: {
          basePrice: true,
          amenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!rooms.length) {
    return "Hiện không có phòng nào trống.";
  }

  return rooms
    .map((r) => {
      const amenitiesList = r.roomType.amenities
        .map((item) => item.amenity.name)
        .join(", ");

      const imagesList = r.images.map((img) => `- ${img.imageUrl}`).join("\n");

      return `Phòng ${r.roomNumber}: ${r.roomType.basePrice} VNĐ/đêm
Tiện nghi:
${amenitiesList}
Hình ảnh:
${imagesList}`;
    })
    .join("\n");
}

export async function OpenAIService(message) {
  // 1. Query DB trước
  const roomInfo = await getRoom();

  // 2. Ghép dữ liệu vào prompt
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Bạn là lễ tân khách sạn. Chỉ trả lời thông tin về khách sạn và đặt phòng dựa trên dữ liệu bên dưới. 
Nếu câu hỏi nằm ngoài thông tin này, hãy từ chối trả lời.

Dữ liệu khách sạn:
${roomInfo}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}
