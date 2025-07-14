import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
      checkBookmarkStatus();
    }
  }, [isAuthenticated, user, docid]);

  const checkBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/bookmarks/check/${docid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
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

      const url = isBookmarked ? `/api/bookmarks/${docid}` : "/api/bookmarks";
      const method = isBookmarked ? "DELETE" : "POST";
      const body = isBookmarked
        ? undefined
        : JSON.stringify({
            docid,
            title,
            court,
            date,
          });

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        ...(body && { body }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      setIsBookmarked(!isBookmarked);

      toast({
        title: isBookmarked ? "Bookmark Removed" : "Case Bookmarked",
        description: isBookmarked
          ? "Case removed from your bookmarks"
          : "Case added to your bookmarks",
      });
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
        <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      )}
      <span className="ml-2">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  );
}
