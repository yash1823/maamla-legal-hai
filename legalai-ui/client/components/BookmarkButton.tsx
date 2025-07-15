import { useState, useEffect } from "react";
import { Heart, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addBookmark, removeBookmark, checkBookmarkStatus } from "@/lib/api";

interface BookmarkButtonProps {
  docid: string;
  title: string;
  court: string;
  date: string;
  className?: string;
}

export function BookmarkButton({
  docid,
  title,
  court,
  date,
  className,
}: BookmarkButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if case is bookmarked on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      checkCurrentBookmarkStatus();
    } else {
      setIsBookmarked(false);
    }
  }, [isAuthenticated, user, docid]);

  const checkCurrentBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const { isBookmarked: bookmarkStatus } = await checkBookmarkStatus(
        token,
        docid,
      );
      setIsBookmarked(bookmarkStatus);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      setIsBookmarked(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark cases.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      if (!isBookmarked) {
        await addBookmark(token, docid, title, court, date);
        setIsBookmarked(true);
        toast({
          title: "Case Bookmarked",
          description: "Case added to your bookmarks",
        });
      } else {
        await removeBookmark(token, docid);
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Case removed from your bookmarks",
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show bookmark button for unauthenticated users
  }

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          className={`h-4 w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`}
        />
      )}
      <span className="ml-2">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  );
}
