export function setTokenCookies(res, accessToken, refreshToken, remember) {
  const maxAgeAccess = remember ? 20 * 60 * 1000 : 15 * 60 * 1000;
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: maxAgeAccess,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
