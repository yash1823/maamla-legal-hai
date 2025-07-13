import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Scale,
  Heart,
  Calendar,
  Building2,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Bookmark } from "@shared/api";

export default function BookmarksPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/bookmarks" } } });
      return;
    }

    fetchBookmarks();
  }, [isAuthenticated, navigate]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch("/api/bookmarks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks");
      }

      const data = await response.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError(err instanceof Error ? err.message : "Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (docid: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`/api/bookmarks/${docid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove bookmark");
      }

      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.docid !== docid),
      );
      toast({
        title: "Bookmark Removed",
        description: "Case removed from your bookmarks",
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Scale className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Maamla Legal Hai
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Your bookmarked cases
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.name}
              </p>
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Your Bookmarks
          </h2>
          <p className="text-muted-foreground">
            Cases you've saved for quick reference
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bookmarks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                No bookmarks yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring cases and bookmark the ones you find interesting
              </p>
              <Button asChild>
                <Link to="/">Start Searching Cases</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4">
              {bookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight">
                          <Link
                            to={`/case/${bookmark.docid}`}
                            className="hover:text-primary transition-colors"
                          >
                            {bookmark.title}
                          </Link>
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{bookmark.court}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(bookmark.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Saved
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBookmark(bookmark.docid)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
