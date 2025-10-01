/**
 * Creates a consistent user response object
 * Excludes sensitive information like password
 */
const createUserResponse = (user, token) => {
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  if (token) {
    userResponse.token = token;
  }

  return userResponse;
};

/**
 * Creates a paginated response object
 */
const createPaginatedResponse = (data, page, limit, total) => ({
  data,
  pagination: {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  }
});

/**
 * Creates a standardized success response
 */
const createSuccessResponse = (message, data = null) => {
  const response = { success: true, message };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

/**
 * Creates a standardized error response
 */
const createErrorResponse = (message, errors = null) => {
  const response = { success: false, message };
  if (errors) {
    response.errors = errors;
  }
  return response;
};

export { 
  createUserResponse, 
  createPaginatedResponse,
  createSuccessResponse,
  createErrorResponse 
};