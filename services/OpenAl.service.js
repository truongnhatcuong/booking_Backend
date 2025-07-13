import { GoogleGenAI } from "@google/genai";
import { prisma } from "../lib/client.js";

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Generate training data
async function generateTrainingData() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        amenities: { include: { amenity: true } },
        rooms: {
          include: {
            bookingItems: {
              include: {
                booking: { include: { reviews: true } },
              },
            },
          },
        },
      },
      take: 10,
    });

    const discounts = await prisma.discount.findMany({
      where: {
        validTo: { gte: new Date() },
        validFrom: { lte: new Date() },
      },
      take: 5,
    });

    const trainingData = [];

    // Training examples
    roomTypes.forEach((roomType) => {
      const availableRooms = roomType.rooms.filter(
        (room) => room.status === "AVAILABLE"
      );
      const amenityNames = roomType.amenities
        .map((a) => a.amenity.name)
        .join(", ");

      if (availableRooms.length > 0) {
        trainingData.push({
          question: `Phòng nào dưới ${Math.ceil(Number(roomType.basePrice) / 1000000)} triệu?`,
          answer: `${roomType.name} với giá ${formatPrice(roomType.basePrice)}/đêm, có ${amenityNames}, còn ${availableRooms.length} phòng trống.`,
        });

        trainingData.push({
          question: `Phòng nào chứa được ${roomType.maxOccupancy} người?`,
          answer: `${roomType.name} chứa được ${roomType.maxOccupancy} người, giá ${formatPrice(roomType.basePrice)}/đêm.`,
        });
      }
    });

    discounts.forEach((discount) => {
      trainingData.push({
        question: `Có mã giảm giá nào không?`,
        answer: `Mã "${discount.code}" giảm ${discount.percentage}%, có hiệu lực đến ${discount.validTo.toLocaleDateString("vi-VN")}.`,
      });
    });

    return trainingData;
  } catch (error) {
    console.error("Error generating training data:", error);
    return [];
  }
}

// Query database based on question
async function queryDatabase(question) {
  try {
    const lowerQuestion = question.toLowerCase();

    // Build query conditions
    let whereClause = {};

    // Price filter
    const priceMatch = lowerQuestion.match(/dưới\s*(\d+)\s*(triệu|nghìn)/);
    if (priceMatch) {
      const amount = parseFloat(priceMatch[1]);
      const unit = priceMatch[2];
      const maxPrice = unit === "triệu" ? amount * 1000000 : amount * 1000;
      whereClause.basePrice = { lte: maxPrice };
    }

    // Occupancy filter
    const occupancyMatch = lowerQuestion.match(/(\d+)\s*người/);
    if (occupancyMatch) {
      whereClause.maxOccupancy = { gte: parseInt(occupancyMatch[1]) };
    }

    // Amenity filter
    const amenityKeywords = ["hồ bơi", "wifi", "gym", "buffet", "spa"];
    const foundAmenity = amenityKeywords.find((amenity) =>
      lowerQuestion.includes(amenity)
    );
    if (foundAmenity) {
      whereClause.amenities = {
        some: {
          amenity: {
            name: { contains: foundAmenity },
          },
        },
      };
    }

    // Query room types
    const roomTypes = await prisma.roomType.findMany({
      where: whereClause,
      include: {
        amenities: { include: { amenity: true } },
        rooms: { where: { status: "AVAILABLE" } },
      },
      take: 5,
    });

    // Query discounts if asked
    let discounts = [];
    if (
      lowerQuestion.includes("giảm giá") ||
      lowerQuestion.includes("khuyến mãi")
    ) {
      discounts = await prisma.discount.findMany({
        where: {
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
        take: 3,
      });
    }

    return { roomTypes, discounts };
  } catch (error) {
    console.error("Error querying database:", error);
    return { roomTypes: [], discounts: [] };
  }
}

// Main service function
export async function hotelAIService(question) {
  try {
    // Get training data and database results
    const trainingData = await generateTrainingData();
    const { roomTypes, discounts } = await queryDatabase(question);

    // Prepare database context
    const dbContext = roomTypes.map((rt) => ({
      name: rt.name,
      price: formatPrice(rt.basePrice),
      maxOccupancy: rt.maxOccupancy,
      amenities: rt.amenities.map((a) => a.amenity.name).join(", "),
      availableRooms: rt.rooms.length,
    }));

    // Create AI prompt
    const prompt = `
Bạn là trợ lý tư vấn khách sạn. Trả lời dựa trên dữ liệu thực tế.

VÍ DỤ:
${trainingData
  .slice(0, 5)
  .map((ex) => `Q: ${ex.question}\nA: ${ex.answer}`)
  .join("\n\n")}

DỮ LIỆU KHÁCH SẠN:
${
  dbContext.length > 0
    ? dbContext
        .map(
          (hotel) =>
            `- ${hotel.name}: ${hotel.price}/đêm, ${hotel.maxOccupancy} người, ${hotel.amenities}, ${hotel.availableRooms} phòng trống`
        )
        .join("\n")
    : "Không tìm thấy phòng phù hợp."
}

${
  discounts.length > 0
    ? `
MÃ GIẢM GIÁ:
${discounts.map((d) => `- ${d.code}: ${d.percentage}%`).join("\n")}`
    : ""
}

CÂUHỎI: "${question}"

Trả lời ngắn gọn, hữu ích bằng tiếng Việt.
`;

    // Call Gemini AI
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error in hotelAIService:", error);
    return "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.";
  } finally {
    await prisma.$disconnect();
  }
}
