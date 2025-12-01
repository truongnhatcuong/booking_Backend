import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { GeminiLLM } from "../lib/ApiAl.js";
import { detectIntent } from "../lib/DetectIntent.js";
import { searchNearbyPlaces } from "../lib/googleMap.js";
import {
  checkRoomAVAILABLE,
  getRoom,
  getRoomType,
} from "../repositories/openai.repo.js";
import WeatherHeader from "../lib/Weather.js";

const llm = new GeminiLLM({ apiKey: process.env.OPENAI_API_KEY });

const hotelInfo = {
  name: "DTU Hotel",
  address: "03 Quang Trung, Hải Châu, Đà Nẵng",
  phone: "0236.xxx.xxxx",
  email: "contact@hotel.com",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  amenities: ["Hồ bơi", "Gym", "Spa", "Nhà hàng", "Bar", "Wifi miễn phí"],
  policies: {
    cancellation: "Hủy miễn phí trước 24h",
    deposit: "Đặt cọc 30%",
    pets: "Không cho phép thú cưng",
  },
};

export async function OpenAITestService(sessionId, message) {
  // Upstash Redis history - SỬA PHẦN NÀY
  const messageHistory = new UpstashRedisChatMessageHistory({
    sessionId,
    config: {
      url: process.env.UPSTASH_REDIS_REST_URL, // REST URL, không phải rediss://
      token: process.env.UPSTASH_REDIS_REST_TOKEN, // REST Token
    },
    sessionTTL: 600, // 10 phút
  });

  // Lấy lịch sử chat
  const previousMessages = await messageHistory.getMessages();

  // Phân tích intent
  const intent = detectIntent(message);

  // Gọi API nếu cần
  let searchPlaces = null,
    roomInfo = null,
    checkAvailable = null,
    roomTypeInfo = null,
    weatherInfo = null;

  if (intent === "nearby") {
    [searchPlaces, weatherInfo] = await Promise.all([
      searchNearbyPlaces(message),
      WeatherHeader(),
    ]);
  } else if (intent === "room") {
    [roomInfo, checkAvailable, roomTypeInfo] = await Promise.all([
      getRoom(),
      checkRoomAVAILABLE(),
      getRoomType(),
    ]);
  } else if (intent === "weather") {
    [weatherInfo, searchPlaces] = await Promise.all([
      WeatherHeader(),
      searchNearbyPlaces(message),
    ]);
  }

  // Tạo prompt system + user
  let systemPrompt = `
Bạn là trợ lý khách sạn ${hotelInfo.name}. Trả lời thân thiện, chính xác, nhiệt tình. 
Thông tin khách sạn: Địa chỉ ${hotelInfo.address}, tiện ích: ${hotelInfo.amenities.join(", ")}, 
check-in: ${hotelInfo.checkInTime}, check-out: ${hotelInfo.checkOutTime}.
`;

  // Thêm dữ liệu context nếu có
  let contextData = `Hôm nay: ${new Date().toLocaleDateString("vi-VN")}\n`;

  if (checkAvailable)
    contextData += `Hiện có ${checkAvailable.count} phòng trống.\n`;
  if (roomInfo && roomInfo.length) {
    contextData += `Danh sách phòng: ${roomInfo.map((r) => `- ${r.roomType.name} (Số khách tối đa: ${r.roomType.maxOccupancy})`).join("\n")}\n`;
  }
  if (searchPlaces && searchPlaces.length) {
    contextData += `Địa điểm gần khách sạn: ${searchPlaces.map((p) => `- ${p.name}`).join("\n")}\n`;
  }
  if (weatherInfo) {
    contextData += `Thời tiết hiện tại: ${weatherInfo.text}, ${weatherInfo.temp}°C\n`;
  }

  const userMessage = `${contextData}\nKhách: ${message}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["user", "{input}"],
  ]);

  const chain = RunnableSequence.from([prompt, llm]);
  const response = await chain.invoke({ input: userMessage });

  const reply =
    response?.content?.parts?.[0]?.text ??
    response?.content ??
    "Xin lỗi, tôi chưa thể trả lời.";

  // Lưu vào Redis
  await messageHistory.addUserMessage(message);
  await messageHistory.addAIMessage(reply);

  // Trả reply + lịch sử chat
  return { reply, history: await messageHistory.getMessages() };
}
