import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkLoader } from "@/components/ui/enhanced-loader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
      const { isBookmarked: bookmarkStatus } = await checkBookmarkStatus(docid);
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
      if (!isBookmarked) {
        await addBookmark(docid, title, court, date);
        setIsBookmarked(true);
        toast({
          title: "Case Bookmarked",
          description: "Case added to your bookmarks",
        });
      } else {
        await removeBookmark(docid);
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
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast({
            title: "Sign up to bookmark cases",
            description: "Create an account to save cases for later reference.",
            action: (
              <Button
                size="sm"
                onClick={() => (window.location.href = "/signup")}
                className="ml-2"
              >
                Sign Up
              </Button>
            ),
          });
        }}
        className={className}
      >
        <Star className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="ml-1 sm:ml-2 text-xs sm:text-sm">
          <span className="hidden sm:inline">Sign up to bookmark</span>
          <span className="sm:hidden">☆</span>
        </span>
      </Button>
    );
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
        <BookmarkLoader action={isBookmarked ? "remove" : "add"} />
      ) : (
        <>
          <Star
            className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`}
          />
          <span className="ml-1 sm:ml-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </span>
            <span className="sm:hidden">{isBookmarked ? "★" : "☆"}</span>
          </span>
        </>
      )}
    </Button>
  );
}
