const { ErrorApi } = require("../utils/errorApi");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const success = err.success !== undefined ? err.success : false;

  res
    .status(statusCode)
    .json({
      message: message,
      success: success,
    //   stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

module.exports = {errorHandler}