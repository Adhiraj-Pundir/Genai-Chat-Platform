import { Router, Request, Response } from "express";
import { createStreamUser, generateStreamToken } from "../services/streamService";
import { RegisterBody, LoginBody } from "../types";

const router = Router();

// In-memory user store for demo — swap with a real DB in production
const users = new Map<string, { password: string; userId: string }>();

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: "username and password required" });
    return;
  }

  if (users.has(username)) {
    res.status(409).json({ success: false, error: "User already exists" });
    return;
  }

  const userId = `user_${username.toLowerCase().replace(/\s+/g, "_")}`;

  await createStreamUser(userId, username);
  const token = generateStreamToken(userId);

  users.set(username, { password, userId });

  res.status(201).json({
    success: true,
    data: { token, userId, username },
  });
});

router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: "username and password required" });
    return;
  }

  const user = users.get(username);
  if (!user || user.password !== password) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  // Ensure user still exists in Stream (handles restarts)
  await createStreamUser(user.userId, username);
  const token = generateStreamToken(user.userId);

  res.json({
    success: true,
    data: { token, userId: user.userId, username },
  });
});

export default router;
