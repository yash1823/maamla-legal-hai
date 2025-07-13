import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import type { BookmarkRequest, Bookmark, BookmarksResponse } from "@shared/api";

// In-memory bookmark storage (replace with database in production)
interface StoredBookmark {
  id: string;
  userId: string;
  docid: string;
  title: string;
  court: string;
  date: string;
  createdAt: Date;
}

const bookmarks: StoredBookmark[] = [];
let nextBookmarkId = 1;

export const handleGetBookmarks: RequestHandler = (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userBookmarks = bookmarks
      .filter((bookmark) => bookmark.userId === req.user!.id)
      .map((bookmark) => ({
        id: bookmark.id,
        docid: bookmark.docid,
        title: bookmark.title,
        court: bookmark.court,
        date: bookmark.date,
        created_at: bookmark.createdAt.toISOString(),
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    const response: BookmarksResponse = {
      bookmarks: userBookmarks,
    };

    res.json(response);
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleAddBookmark: RequestHandler = (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { docid, title, court, date } = req.body;

    if (!docid || !title || !court || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if already bookmarked
    const existingBookmark = bookmarks.find(
      (bookmark) =>
        bookmark.userId === req.user!.id && bookmark.docid === docid,
    );

    if (existingBookmark) {
      return res.status(409).json({ message: "Case already bookmarked" });
    }

    // Create bookmark
    const newBookmark: StoredBookmark = {
      id: nextBookmarkId.toString(),
      userId: req.user.id,
      docid,
      title,
      court,
      date,
      createdAt: new Date(),
    };

    bookmarks.push(newBookmark);
    nextBookmarkId++;

    const response: Bookmark = {
      id: newBookmark.id,
      docid: newBookmark.docid,
      title: newBookmark.title,
      court: newBookmark.court,
      date: newBookmark.date,
      created_at: newBookmark.createdAt.toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleRemoveBookmark: RequestHandler = (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { docid } = req.params;

    if (!docid) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Find and remove bookmark
    const bookmarkIndex = bookmarks.findIndex(
      (bookmark) =>
        bookmark.userId === req.user!.id && bookmark.docid === docid,
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    bookmarks.splice(bookmarkIndex, 1);

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleCheckBookmark: RequestHandler = (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { docid } = req.params;

    if (!docid) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const isBookmarked = bookmarks.some(
      (bookmark) =>
        bookmark.userId === req.user!.id && bookmark.docid === docid,
    );

    res.json({ isBookmarked });
  } catch (error) {
    console.error("Check bookmark error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
