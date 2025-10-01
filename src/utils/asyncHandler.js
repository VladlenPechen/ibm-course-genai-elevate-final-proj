/**
 * Async handler to wrap async route handlers and catch errors
 * Eliminates the need for try-catch blocks in every async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;