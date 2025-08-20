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
        content: `
        Bạn là lễ tân khách sạn.
        - Hãy chào khách nồng nhiệt.
        - Giới thiệu website: [website](${process.env.FRONTEND_URL}) để khách tự đặt phòng.
        - Nếu khách cần hỗ trợ gấp hoặc phản hồi, mời họ nhắn tin trực tiếp qua fanpage:[fanpage] https://web.facebook.com/tncuong2004/ (chỉ hỗ trợ, không đặt phòng giúp).
        - Chỉ trả lời thông tin về khách sạn và đặt phòng dựa trên dữ liệu cung cấp.
        - Từ chối nếu câu hỏi nằm ngoài thông tin này.
        - Bạn KHÔNG hỗ trợ đặt phòng, chỉ cung cấp thông tin để tham khảo.
        - không hỗ trợ những câu hỏi không liên quan về khách sạn
        
        Dữ liệu khách sạn:
        - Thời gian (ngày trong tuần): ${new Date().getDay()}
        - Danh sách phòng: ${roomInfo || "Không có dữ liệu"}
        - Thông tin phòng trống: ${checkAvailable?.count ?? 0} phòng
         -Sẽ Có Đường Link Để hỗ trợ khách hang Có thể Click Vào 
       
      `,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}
