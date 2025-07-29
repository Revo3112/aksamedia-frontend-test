import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/crud", "routes/crud.tsx"),
] satisfies RouteConfig;
