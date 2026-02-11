import type { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

