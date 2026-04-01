const TOKEN_STORAGE_KEY = "token";
const USER_ID_STORAGE_KEY = "userId";
const USER_TYPE_STORAGE_KEY = "type";

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payloadJson = atob(padded);

    return JSON.parse(payloadJson);
  } catch (error) {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const isTokenValid = (token) => {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  return payload.exp * 1000 > Date.now();
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(USER_TYPE_STORAGE_KEY);
};
