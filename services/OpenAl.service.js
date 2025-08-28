import OpenAI from "openai";
import { prisma } from "../lib/client.js";
import { formatPrice } from "../lib/format.js";

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
      id: true,
      roomNumber: true,
      images: true,
      status: true,
      roomType: {
        select: {
          id: true,
          basePrice: true,
          maxOccupancy: true,
          description: true,
          name: true,
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

  return rooms
    .map((r) => {
      const amenitiesList = r.roomType.amenities
        .map((item) => item.amenity.name)
        .join(", ");

      const imagesList = r.images.map((img) => `- ${img.imageUrl}`).join("\n");
      const roomUrl = `${process.env.FRONTEND_URL}/rooms/${r.roomType.id}/${r.id}`;

      return `Phòng ${r.roomNumber}: ${formatPrice(r.roomType.basePrice)}/đêm
Loại Phòng: ${r.roomType.name}
Tiện nghi:
${amenitiesList}
Số Khách Tối Đa:
${r.roomType.maxOccupancy}
Mô tả: ${r.roomType.description || "Không có mô tả"}
Hình ảnh:
${imagesList};
[Xem chi tiết phòng](${roomUrl}):`; // link xem phòng
    })
    .join("\n\n\n");
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

let conversation = [
  {
    role: "system",
    content: `
      Bạn là lễ tân khách sạn.
      - Luôn chào khách nồng nhiệt.
      - Giới thiệu website: [website](${process.env.FRONTEND_URL}) để khách tự đặt phòng.
      - Nếu cần hỗ trợ gấp, mời khách nhắn tin trực tiếp qua [fanpage](https://web.facebook.com/tncuong2004/).
      - Chỉ trả lời thông tin về khách sạn và đặt phòng dựa trên dữ liệu cung cấp.
      - Từ chối nếu câu hỏi nằm ngoài thông tin này.
      - Bạn KHÔNG hỗ trợ đặt phòng, chỉ cung cấp thông tin để tham khảo.
    `,
  },
];

export async function OpenAIService(message) {
  // 1. Query DB trước

  const roomInfo = await getRoom();
  const checkAvailable = await checkRoomAVAILABLE();
  const now = new Date();
  const dateString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  // 2. Ghép dữ liệu vào prompt
  conversation.push({
    role: "user",
    content: `
  Hôm nay là ${dateString}.
  Hiện có ${checkAvailable.count} phòng trống.
  Danh sách phòng:
  ${roomInfo}
  Khách nhắn: ${message}
  `,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
  });

  const reply = completion.choices[0].message.content;

  conversation.push({ role: "assistant", content: reply });

  return reply;
}
