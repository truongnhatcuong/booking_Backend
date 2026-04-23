// services/faceService.js

import { prisma } from "../lib/client.js";

/** Lưu vào DB — convert Float32Array/array → JSON string */
export function serializeDescriptor(descriptor) {
  return JSON.stringify(Array.from(descriptor));
}

/** Đọc từ DB — convert JSON string → array */
export function deserializeDescriptor(str) {
  if (!str) return null;
  return JSON.parse(str);
}

/** So sánh 2 descriptor */
export function compareFaces(descriptor1, descriptor2, threshold = 0.5) {
  const d1 = Array.from(descriptor1);
  const d2 = Array.from(descriptor2);
  const distance = Math.sqrt(
    d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0),
  );
  return { matched: distance < threshold, distance };
}

export async function updateFaceDescriptorService(userId, descriptor) {
  const serialized = JSON.stringify(descriptor);
  await prisma.user.update({
    where: { id: userId },
    data: { faceDescriptor: serialized },
  });
}

export const getGoogleTTS = async (text) => {
  const MAX_LENGTH = 200;

  // 1. Hàm chia nhỏ văn bản theo dấu câu hoặc khoảng trắng
  const splitText = (input) => {
    const chunks = [];
    const sentences = input.match(/[^.?!,:;]+[.?!,:;]*\s*/g) || [input];

    let currentChunk = "";
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= MAX_LENGTH) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());

        // Nếu một câu đơn lẻ vẫn quá dài 200 ký tự, chia theo khoảng trắng
        if (sentence.length > MAX_LENGTH) {
          const words = sentence.split(" ");
          let temp = "";
          for (const word of words) {
            if ((temp + word).length + 1 <= MAX_LENGTH) {
              temp += (temp ? " " : "") + word;
            } else {
              chunks.push(temp.trim());
              temp = word;
            }
          }
          currentChunk = temp;
        } else {
          currentChunk = sentence;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  const chunks = splitText(text);
  const audioBuffers = [];

  // 2. Lấy dữ liệu âm thanh cho từng đoạn (Tuần tự để tránh rate limit)
  for (const chunk of chunks) {
    if (!chunk) continue;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob&ttsspeed=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!response.ok) throw new Error(`Google TTS failed for chunk: ${chunk}`);

    const arrayBuffer = await response.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }

  // 3. Nối tất cả các buffer lại thành một file mp3 duy nhất
  return Buffer.concat(audioBuffers);
};
