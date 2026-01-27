import AttributeAPI from "./attributes";
import AuthAPI from "./auth";
import UserAPI from "./users";
import TenantsAPI from "./tenants";
import DictAPI from "./dict";

export { AuthAPI, UserAPI, TenantsAPI, DictAPI };

const API = {
  Auth: AuthAPI,
  User: UserAPI,
  AttributeAPI: AttributeAPI,
  Tenants: TenantsAPI,
  Dict: DictAPI,
};
export default API;
