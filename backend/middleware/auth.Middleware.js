const jwt = require ("jsonwebtoken");
const {asyncHandler} = require("../utils/asyncHandler");
const { PrismaClient } = require ("../generated/prisma");
const {ErrorApi} = require("../utils/errorApi");

const prisma = new PrismaClient();

 const protectedRoute = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!req.user) throw new ErrorApi("User not found", 401);
    next();
  } else {
    throw new ErrorApi("Not authorized, token missing", 401);
  }
});

 const admin = (req, res, next) => {
    console.log("logged in User",req.user)
  if (req.user.role !== "ADMIN") {
    throw new ErrorApi("Admin access only", 403);
  }
  next();
};
module.exports = {protectedRoute ,admin}
