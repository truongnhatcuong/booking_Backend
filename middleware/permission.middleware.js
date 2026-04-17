import { hasUserPermission } from "../lib/hasUserPermission.js";

export const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!hasUserPermission(user, permission)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
};
