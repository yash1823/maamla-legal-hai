import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleSignup, handleGetUser } from "./routes/auth";
import {
  handleGetBookmarks,
  handleAddBookmark,
  handleRemoveBookmark,
  handleCheckBookmark,
} from "./routes/bookmarks";
import {
  handleSearch,
  handleGetCaseDetail,
  handleSummarizeCase,
  handleGetRelevance,
} from "./routes/search";
import { authenticateToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes (match frontend expectations)
  app.post("/api/login", handleLogin);
  app.post("/api/signup", handleSignup);
  app.get("/api/me", authenticateToken, handleGetUser);

  // Bookmark routes
  app.get("/api/bookmarks", authenticateToken, handleGetBookmarks);
  app.post("/api/bookmarks", authenticateToken, handleAddBookmark);
  app.delete("/api/bookmarks/:docid", authenticateToken, handleRemoveBookmark);
  app.get(
    "/api/bookmarks/check/:docid",
    authenticateToken,
    handleCheckBookmark,
  );

  // Search and case routes
  app.post("/api/search", handleSearch);
  app.post("/api/doc/:docid", handleGetCaseDetail);
  app.post("/api/summarize/:docid", handleSummarizeCase);
  app.get("/api/relevance/:docid", handleGetRelevance);

  return app;
}
