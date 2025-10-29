import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// middleware simples de verificação
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// rota pública (para gerar token de teste)
app.post("/auth/login", (req, res) => {
  const { username = "john_doe" } = req.body;
  const token = jwt.sign(
    { sub: username, role: "user" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ access_token: token });
});

// rota protegida
app.get("/users/me", authMiddleware, (req, res) => {
  res.json({
    id: 1,
    username: req.user.sub,
    role: req.user.role,
    message: "Access granted via valid JWT"
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Users API running on http://localhost:${port}`);
});
