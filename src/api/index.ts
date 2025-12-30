import AuthAPI from "./auth";
import UserAPI from "./users"; // 你刚加的文件

export { AuthAPI, UserAPI };

const API = {
  Auth: AuthAPI,
  User: UserAPI,
};
export default API;
