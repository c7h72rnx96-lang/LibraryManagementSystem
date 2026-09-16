export const responseFormatter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // If it's already formatted (like our error handler), pass it through
    if (data && typeof data.success !== "undefined") {
      return originalJson.call(this, data);
    }

    // Wrap successful responses globally
    const wrappedData = {
      success: true,
      data: data,
    };
    return originalJson.call(this, wrappedData);
  };
  next();
};
