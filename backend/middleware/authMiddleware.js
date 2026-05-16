const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const { findUserById } = require("../services/userService");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  const user = await findUserById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      res.status(403);
      next(new Error("You do not have permission to perform this action"));
      return;
    }

    next();
  };
}

module.exports = { authorize, protect };
