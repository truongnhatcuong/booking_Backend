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
    where: {
      status: "AVAILABLE",
    },

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
          maxOccupancy: true,
          description: true,
          name: true,
        },
      },
    },
  });

  return rooms
    .map((r) => {
      const amenitiesList = r.roomType.amenities
        .map((item) => item.amenity.name)
        .join(", ");

      const imagesList = r.images.map((img) => `- ${img.imageUrl}`).join("\n");

      return `Phòng ${r.roomNumber}: ${r.roomType.basePrice} VNĐ/đêm
Loại Phòng: ${r.roomType.name}
Tiện nghi:
${amenitiesList}
Số Khách Tối Đa:
${r.roomType.maxOccupancy}
Mô tả: ${r.roomType.description || "Không có mô tả"}
Hình ảnh:
${imagesList}`;
    })
    .join("\n\n");
}

async function checkRoomAVAILABLE() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },
  });

  return {
    count: rooms.length,
  };
}

export async function OpenAIService(message) {
  // 1. Query DB trước

  const roomInfo = await getRoom();
  const checkAvailable = await checkRoomAVAILABLE();

  // 2. Ghép dữ liệu vào prompt
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Bạn là lễ tân khách sạn. Chỉ trả lời thông tin về khách sạn và đặt phòng dựa trên dữ liệu bên dưới. 
Nếu câu hỏi nằm ngoài thông tin này, hãy từ chối trả lời.

Dữ liệu khách sạn:
thời gian ${new Date().getDay()}: Danh sách phòng: ${roomInfo}`,
      },
      {
        role: "system",
        content: `bạn không hỗ trợ đặt phòng chỉ hỗ trợ đưa ra thông tin để khách tham khảo`,
      },
      {
        role: "system",
        content: `Thông tin phòng trống:
Số lượng phòng: ${checkAvailable.count}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}
