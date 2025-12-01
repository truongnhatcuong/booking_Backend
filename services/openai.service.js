import axios from "axios";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { searchNearbyPlaces } from "../lib/googleMap.js";
import {
  checkRoomAVAILABLE,
  getRoom,
  getRoomType,
} from "../repositories/openai.repo.js";
import WeatherHeader from "../lib/Weather.js";
import { GeminiLLM } from "../lib/ApiAl.js";
import { formatPrice } from "../lib/format.js";
import { detectIntent } from "../lib/DetectIntent.js";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";

const llm = new GeminiLLM({
  apiKey: process.env.OPENAI_API_KEY,
});

// const llm = new DeepSeekLLM();

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

let lastIntent = null; // Lưu intent của tin nhắn trước
let lastContext = {}; // Lưu dữ liệu API đã gọi

// ===== HÀM PHÁT HIỆN CÂU HỎI TIẾP THEO =====
function isContinuationQuestion(message, lastIntent) {
  const msg = message.toLowerCase().trim();

  // Các từ khóa tiếp nối câu hỏi
  const continuationWords = [
    "còn",
    "thêm",
    "nữa",
    "chi tiết",
    "cụ thể",
    "rõ hơn",
    "how about",
    "what about",
    "and",
    "also",
    "more",
    "thế còn",
    "vậy còn",
    "còn gì",
    "thế",
    "vậy",
    "tôi muốn",
    "cho tôi",
    "giúp tôi",
    "show me",
    "tell me",
  ];

  // Nếu tin nhắn ngắn (<50 ký tự) và chứa từ tiếp nối
  if (msg.length < 50 && continuationWords.some((word) => msg.includes(word))) {
    return true;
  }

  // Nếu tin nhắn không có intent rõ ràng nhưng lastIntent tồn tại
  const currentIntent = detectIntent(message);
  if (currentIntent === "general" && lastIntent && lastIntent !== "general") {
    return true;
  }

  return false;
}

// ===== HÀM CHÍNH: XỬ LÝ TIN NHẮN =====
export async function OpenAIService(message, sessionId) {
  const messageHistory = new UpstashRedisChatMessageHistory({
    sessionId,
    config: {
      url: process.env.UPSTASH_REDIS_REST_URL, // REST URL, không phải rediss://
      token: process.env.UPSTASH_REDIS_REST_TOKEN, // REST Token
    },
    sessionTTL: 600, // 10 phút
  });
  // 1️⃣ Retrieve existing conversation history
  // const previousMessages = await messageHistory.getMessages();

  try {
    // 1️⃣ PHÂN TÍCH Ý ĐỊNH CỦA USER
    let intent = detectIntent(message);

    // 2️⃣ KIỂM TRA XEM CÓ PHẢI CÂU HỎI TIẾP THEO KHÔNG
    const isContinuation = isContinuationQuestion(message, lastIntent);

    if (isContinuation && lastIntent) {
      // Nếu là câu hỏi tiếp theo, giữ nguyên intent trước đó
      console.log(`🔗 Continuation detected. Using last intent: ${lastIntent}`);
      intent = lastIntent;
    } else {
      // Cập nhật intent mới
      if (intent !== "general") lastIntent = intent;
    }

    console.log(`🎯 Intent detected: ${intent}`);

    // 3️⃣ CHỈ GỌI API CẦN THIẾT DỰA TRÊN INTENT
    let searchPlaces = null;
    let roomInfo = null;
    let checkAvailable = null;
    let roomTypeInfo = null;
    let weatherInfo = null;

    if (intent === "nearby") {
      console.log("📍 Calling: searchNearbyPlaces + WeatherHeader");
      [searchPlaces, weatherInfo] = await Promise.all([
        searchNearbyPlaces(message),
        WeatherHeader(),
      ]);

      // Lưu vào context để dùng cho câu hỏi tiếp theo
      lastContext = { searchPlaces, weatherInfo };
    } else if (intent === "room") {
      console.log("🛏️ Calling: getRoom + checkRoomAVAILABLE + getRoomType");
      [roomInfo, checkAvailable, roomTypeInfo] = await Promise.all([
        getRoom(),
        checkRoomAVAILABLE(),
        getRoomType(),
      ]);

      // Lưu vào context
      lastContext = { roomInfo, checkAvailable, roomTypeInfo };
    } else if (intent === "weather") {
      console.log("🌤️ Calling: WeatherHeader + searchNearbyPlaces");
      [weatherInfo, searchPlaces] = await Promise.all([
        WeatherHeader(),
        searchNearbyPlaces(message),
      ]);

      lastContext = { weatherInfo, searchPlaces };
    } else if (intent === "hotel_info") {
      console.log("🏨 No API call needed for hotel_info");
      ("-Trả Lời Những Yêu cầu của khách hàng");
      // Không cần gọi API, dùng hotelInfo có sẵn
    } else {
      // general - kiểm tra xem có lastContext không
      if (isContinuation && lastContext) {
        console.log("♻️ Reusing last context data");
        // Sử dụng lại dữ liệu từ lần trước
        searchPlaces = lastContext.searchPlaces || null;
        roomInfo = lastContext.roomInfo || null;
        checkAvailable = lastContext.checkAvailable || null;
        roomTypeInfo = lastContext.roomTypeInfo || null;
        weatherInfo = lastContext.weatherInfo || null;
      }
    }

    const systemPrompt = `
=== HƯỚNG DẪN TRẢ LỜI ===
Bạn là lễ tân khách sạn chuyên nghiệp.
Khi trả lời khách, hãy tuân theo các quy tắc sau:

1. **Cấu trúc câu trả lời**:
   - Chào hỏi thân thiện (nếu là tin nhắn đầu)
   - Trả lời chính xác câu hỏi
   - Bổ sung thông tin liên quan (nếu hữu ích)
   - Hỏi lại nếu cần thêm thông tin

2. **Khi giới thiệu phòng**:
   - hãy giới thiệu những loại phòng có sẵn
   - Tên Phòng
   - Diện tích
   - Số người tối đa
   - Tiện nghi nổi bật
   - Hình ảnh Phòng
   - Gợi ý xem thêm tại website

3. **Khi giới thiệu địa điểm**:
   - Tên địa điểm
   - Khoảng cách từ khách sạn
   - Đánh giá (nếu có)
   - Link Google Maps (hiển thị đường link cho khách hàng click vào)

4. **Emoji phù hợp**: 🏨 🛏️ 🌊 ☀️ 🌧️ ⭐ 📍 🚗 🍽️

5. **Tone**: Thân thiện, chuyên nghiệp, nhiệt tình nhưng không lan man.
   - Nếu câu hỏi không liên quan, trả lời ngắn gọn và hướng khách quay lại chủ đề khách sạn.
   - Chỉ trả lời về khách sạn, phòng và địa điểm xung quanh.
   - Không tự bịa thông tin ngoài dữ liệu.
   - Khi khách hỏi tiếp chi tiết, trả lời cụ thể dựa trên dữ liệu có sẵn.

(Hãy giới thiệu về thông tin khách sạn đầu tiên nhé)

=== THÔNG TIN KHÁCH SẠN ===
- Tên: ${hotelInfo.name}
- Địa chỉ: ${hotelInfo.address}
- Hotline: ${hotelInfo.phone}
- Website: [website](${process.env.FRONTEND_URL})
- Check-in: ${hotelInfo.checkInTime} | Check-out: ${hotelInfo.checkOutTime}
- Tiện ích: ${hotelInfo.amenities.join(", ")}
- Chính sách hủy: ${hotelInfo.policies.cancellation}
- Đặt cọc: ${hotelInfo.policies.deposit}
`;

    // 5️⃣ TẠO PROMPT ĐỘNG DỰA TRÊN DỮ LIỆU CÓ
    let contextData = `Hôm nay là ${new Date().toLocaleDateString("vi-VN")}.`;

    // ===== THÊM THÔNG TIN PHÒNG (NẾU CÓ) =====
    if (checkAvailable) {
      contextData += `\nHiện có ${checkAvailable.count} phòng trống.`;
    }

    if (roomInfo && roomInfo.length > 0) {
      contextData += `\n\n=== DANH SÁCH PHÒNG ===\n`;
      contextData += roomInfo
        .map((r) => {
          const amenitiesList = r.roomType.amenities
            .map((item) => item.amenity.name)
            .join(", ");

          const imagesList = r.images?.length
            ? `![Hình ảnh phòng](${r.images[0].imageUrl})`
            : "Không có hình ảnh";

          const roomUrl = `${process.env.FRONTEND_URL}/rooms/${r.roomType.id}/${r.id}`;

          return `**Phòng ${r.roomNumber}**: ${formatPrice(r.originalPrice)}/đêm
- Loại Phòng: ${r.roomType.name}
- Tiện nghi: ${amenitiesList}
- Số Khách Tối Đa: ${r.roomType.maxOccupancy}
- Mô tả: ${r.roomType.description || "Không có mô tả"}
- Hình ảnh: ${imagesList}
- [Xem chi tiết phòng](${roomUrl})`;
        })
        .join("\n\n");
    }

    if (roomTypeInfo && roomTypeInfo.length > 0) {
      contextData += `\n\n=== DANH SÁCH LOẠI PHÒNG ===\n${roomTypeInfo.join("\n\n")}`;
    }

    // ===== THÊM THÔNG TIN ĐỊA ĐIỂM (NẾU CÓ) =====
    if (searchPlaces && searchPlaces.length > 0) {
      contextData += `\n\n=== ĐỊA ĐIỂM GẦN KHÁCH SẠN ===\n`;
      contextData += searchPlaces
        .map(
          (p, index) =>
            `${index + 1}. **${p.ten || p.name}**
   - Địa chỉ: ${p.dia_chi ? `[Xem trên Google Maps](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.dia_chi)})` : "Không có"}
   - Đánh giá: ${p.danh_gia ?? "chưa có đánh giá"} ⭐
   - Số đánh giá: ${p.so_danh_gia ? p.so_danh_gia + " lượt" : "Không có"}
   - Hình ảnh: ${p.hinh_anh || "Không có"}`
        )
        .join("\n\n");
    }

    // ===== THÊM THÔNG TIN THỜI TIẾT (NẾU CÓ) =====
    if (weatherInfo) {
      contextData += `\n\n=== THỜI TIẾT & GỢI Ý ===
- Hình ảnh thời tiết: ${weatherInfo.icon}
- ${weatherInfo.isDay ? "Hôm nay là ngày" : "Hiện tại là ban đêm"} (${weatherInfo.localtime})
- Thời tiết tại Đà Nẵng: ${weatherInfo.text}, nhiệt độ ${weatherInfo.temp}°C

**Gợi ý dựa trên thời tiết:**
1. Nếu khách chỉ hỏi "gần khách sạn", chỉ hiển thị địa điểm trong bán kính 3km.
2. Nếu khách hỏi về lộ trình du lịch, có thể mở rộng phạm vi 20–30km quanh Đà Nẵng.
3. Ưu tiên các địa điểm nổi tiếng, được đánh giá cao, phù hợp thời tiết.
4. Với mỗi địa điểm, nêu rõ: Địa chỉ (kèm link Google Maps), Giờ mở cửa, Giá vé (nếu có), Hoạt động nổi bật.
5. Lưu ý: Không gợi ý khách sạn hoặc hotel nào khác và đưa lộ trình đi chơi thật chính xác (liệt kê ra những địa điểm nổi bật của Đà Nẵng).`;
    }

    // ===== TẠO PROMPT HOÀN CHỈNH =====
    const userMessage = `${contextData}

QUAN TRỌNG: 
- Chỉ dùng thông tin từ dữ liệu trên. Không bịa thêm.
- Nếu khách hỏi chi tiết về một phòng/địa điểm cụ thể, hãy trả lời dựa trên dữ liệu đã có.
- Nếu khách hỏi tiếp về chủ đề trước, hãy dựa vào ngữ cảnh cuộc hội thoại.

=== TIN NHẮN KHÁCH ===
${message}`;

    // 6️⃣ GỌI AI ĐỂ TẠO CÂU TRẢ LỜI
    const prompt = ChatPromptTemplate.fromMessages([
      ["assistant", systemPrompt],
      ["user", "{input}"],
    ]);

    const chain = RunnableSequence.from([prompt, llm]);
    const response = await chain.invoke({
      input: userMessage,
    });

    // 7️⃣ LƯU VÀO CONVERSATION HISTORY
    const reply =
      response?.content.parts[0].text ?? "Xin lỗi, tôi chưa thể trả lời.";

    // const reply = response?.content ?? "Xin lỗi, tôi chưa thể trả lời.";

    await messageHistory.addUserMessage(message);
    await messageHistory.addAIMessage(reply);

    console.log("✅ Response generated successfully");
    return { reply, history: await messageHistory.getMessages() };
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    return "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng liên hệ fanpage để được hỗ trợ.";
  }
}

//get chatbot
export async function GetChatHistoryService(sessionId) {
  if (!sessionId) {
    return { sessionId: null, history: [] };
  }

  // Kết nối Upstash Redis
  const messageHistory = new UpstashRedisChatMessageHistory({
    sessionId,
    config: {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    sessionTTL: 600, // 10 phút
  });

  // ✅ Lấy danh sách tin nhắn trong session
  const history = await messageHistory.getMessages();

  // Trả kết quả
  return {
    sessionId,
    history,
  };
}

function extractKeyword(topic) {
  if (!topic) return "";

  // 1. Lấy phần trước dấu "-" hoặc "–" nếu có
  const parts = topic
    .split(/[-–]/)
    .map((p) => p.trim())
    .filter(Boolean);
  let keyword = parts[0] || topic;

  // 2. Loại bỏ dấu tiếng Việt
  keyword = keyword
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  keyword = encodeURIComponent(keyword);

  return keyword;
}

//ai about generate-post
export async function generatePostService(topic) {
  const keyword = extractKeyword(topic);

  const url = `https://api.unsplash.com/search/photos?query=${keyword}&client_id=SbfhmV7iVU5kw8YQRh0p7cwiMdKmWvgSuPj-l_j5bvk`;
  console.log(url);

  const response = await axios.get(url);

  if (!response.data.results || response.data.results.length === 0) {
    throw new Error(`Không tìm thấy ảnh cho từ khóa: ${keyword}`);
  }

  // const coverImage = response.data.results[0].urls.regular;
  const contentImages = response.data.results.map((img) => img.urls.regular);

  const prompt = `
Bạn là một content writer chuyên nghiệp với 10 năm kinh nghiệm viết blog.

NHIỆM VỤ: Tạo một bài viết blog chất lượng cao về chủ đề: "${topic}"

YÊU CẦU CỤ THỂ:
1. Tiêu đề: Hấp dẫn, có từ khóa SEO, dài 50-60 ký tự
2. Tóm tắt: 2-3 câu súc tích, gây tò mò cho người đọc
3. Nội dung:
   - Chia thành 4-6 phần rõ ràng với tiêu đề phụ (##)
   - Có phần mở đầu thu hút (hook)
   - Có phần kết luận và call-to-action
   - Chèn ảnh bằng markdown: ![alt text](URL)
   - Ảnh liên quan: ${contentImages?.join(", ") || "Không có"}
   - Giọng văn: Chuyên nghiệp nhưng thân thiện, dễ hiểu

Trả về **100% JSON hợp lệ**, đúng format:
{
  "title": "Tiêu đề bài viết",
  "summary": "Tóm tắt 2-3 câu",
  "content": "Nội dung bài viết",
  "coverImage": "${contentImages || "https://example.com/default.jpg"}(chỉ một ảnh duy nhất)"
}

LƯU Ý:
- Chỉ trả về JSON hợp lệ, không markdown, không text ngoài
- Viết bằng Tiếng Việt tự nhiên, cuốn hút
`;
  const result = await llm._call(prompt);
  // ✅ Trích text ra từ object trả về
  const text = result?.content?.parts?.[0]?.text ?? "Không có phản hồi.";
  const cleanText = text
    .replace(/^```json\s*/i, "") // bỏ mở đầu ```json
    .replace(/```$/i, "") // bỏ ``` cuối
    .trim();
  let parsed;
  parsed = JSON.parse(cleanText);
  console.log("🧩 AI raw response:", parsed);

  return parsed;
}
