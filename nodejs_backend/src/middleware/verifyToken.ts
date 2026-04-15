import { Response, NextFunction } from "express";
import { serverClient } from "../services/streamService";
import { AuthenticatedRequest } from "../types";

export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Stream tokens are JWTs — decode the payload to extract userId
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf8")
    );
    req.userId = payload.user_id as string;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
}
