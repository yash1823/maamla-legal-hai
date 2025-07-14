import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addBookmark, removeBookmark } from "@/lib/api";

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
    // For now, we'll skip checking bookmark status
    // The backend doesn't have a check endpoint yet
    // You could implement this if needed
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
        <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      )}
      <span className="ml-2">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  );
}
