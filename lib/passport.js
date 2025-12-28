import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/client.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";

        if (!email) {
          return done(new Error("Google account has no email"));
        }
        let user = null;
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              userType: "CUSTOMER",
              status: "ACTIVE",

              customer: {
                create: {},
              },
            },
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { customer: true, employee: true },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
