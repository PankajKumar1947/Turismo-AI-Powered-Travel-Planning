export const authQueries = {
  register: {
    key: ["auth", "register"],
    endpoint: "/api/auth/register",
  },
  login: {
    key: ["auth", "login"],
    endpoint: "/api/auth/login",
  },
  me: {
    key: ["auth", "me"],
    endpoint: "/api/auth/me",
  },
  updateMe: {
    key: ["auth", "updateMe"],
    endpoint: "/api/auth/me",
  },
};
