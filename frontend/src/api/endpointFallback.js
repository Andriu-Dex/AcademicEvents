const FALLBACK_STATUSES = new Set([404, 405, 501]);

const shouldFallback = (error) => {
  const status = error?.response?.status;
  return FALLBACK_STATUSES.has(status);
};

/**
 * Executes a primary API call and, for known compatibility statuses,
 * retries using a legacy endpoint.
 */
export const requestWithEndpointFallback = async (
  primaryRequest,
  fallbackRequest
) => {
  try {
    return await primaryRequest();
  } catch (error) {
    if (fallbackRequest && shouldFallback(error)) {
      return fallbackRequest();
    }
    throw error;
  }
};
