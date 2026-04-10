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
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob&ttsspeed=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://translate.google.com/",
    },
  });

  if (!response.ok) throw new Error("Google TTS request failed");

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
