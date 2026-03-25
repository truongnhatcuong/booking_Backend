import { createClient } from "redis";

const redisClient = createClient({
  password: process.env.PasswordRedis || "",
  socket: {
    host: "redis-15242.crce174.ca-central-1-1.ec2.cloud.redislabs.com",
    port: 15242,
  },
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));

// Tự động kết nối khi file được import
(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud!");
  }
})();

export default redisClient;
