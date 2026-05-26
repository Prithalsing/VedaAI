import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY || "veda-ai-secure-secret-token-2024";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers["x-api-key"];

  const providedToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : apiKeyHeader;

  if (!providedToken || providedToken !== API_KEY) {
    res.status(401).json({ success: false, message: "Unauthorized API Request" });
    return;
  }

  next();
};
