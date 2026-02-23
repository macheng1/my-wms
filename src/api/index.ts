import AttributeAPI from "./attributes";
import AuthAPI from "./auth";
import UserAPI from "./users";
import TenantsAPI from "./tenants";
import DictAPI from "./dict";
import NotificationAPI from "./notifications";

export { AuthAPI, UserAPI, TenantsAPI, DictAPI, NotificationAPI };

const API = {
  Auth: AuthAPI,
  User: UserAPI,
  AttributeAPI: AttributeAPI,
  Tenants: TenantsAPI,
  Dict: DictAPI,
  Notification: NotificationAPI,
};
export default API;
