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
import { getBookmarks, removeBookmark } from "@/lib/api";
import type { Bookmark } from "@shared/api";
import { motion, AnimatePresence } from "framer-motion";

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

      const data = await getBookmarks(token);
      setBookmarks(data || []);
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
      if (!token) throw new Error("You must be logged in");

      await removeBookmark(token, docid);
      setBookmarks((prev) => prev.filter((b) => b.docid !== docid));

      toast({
        title: "Bookmark removed",
        description: "This case has been removed from your bookmarks.",
      });
    } catch (error) {
      console.error("❌ Error removing bookmark:", error);
      toast({
        title: "Failed to remove bookmark",
        description:
          error instanceof Error ? error.message : "Unexpected error occurred.",
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

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="flex flex-col items-center justify-center py-24 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your bookmarks...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Your Bookmarks
          </h2>
          <p className="text-muted-foreground">
            Cases you've saved for quick reference
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  No bookmarks yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring cases and bookmark the ones you find
                  interesting
                </p>
                <Button asChild>
                  <Link to="/">Start Searching Cases</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            <p className="text-sm text-muted-foreground">
              {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
            </p>

            <div className="grid gap-4">
              <AnimatePresence>
                {bookmarks.map((bookmark) => (
                  <motion.div
                    key={bookmark.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
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
                              onClick={() =>
                                handleRemoveBookmark(bookmark.docid)
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
