function NotFoundError(message) {
  const error = new Error(message);
  error.name = "NotFoundError";
  error.status = 400;
  error.timestamp = new Date().toISOString();

  console.log("[NotFoundError]", {
    message: error.message,
    name: error.name,
    status: error.status,
    timestamp: error.timestamp,
  });

  return error;
}

export default NotFoundError;
