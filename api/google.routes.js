import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const GoogleRouter = Router();

GoogleRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

GoogleRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/signIn?error=google_failed`,
  }),
  (req, res) => {
    const user = req.user;

    // nếu bạn chưa làm JWT thì tạm redirect về FE
    const accessToken = jwt.sign(
      {
        id: user.id,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // local dev
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?token=${accessToken}`
    );
  }
);

export default GoogleRouter;
