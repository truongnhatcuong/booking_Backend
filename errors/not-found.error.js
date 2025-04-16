function NotFoundError(message) {
  const error = new Error(message);
  error.name = "NotFoundError";
  error.status = 404;
  return error;
}

export default NotFoundError;
