import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Scale, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Scale className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Maamla Legal Hai
                </h1>
                <p className="text-sm text-muted-foreground">
                  Search Indian legal cases and judgments
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-muted rounded-full">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">404</h1>
              <h2 className="text-xl font-semibold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground">
                The legal case or page you're looking for doesn't exist or may
                have been moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="flex items-center gap-2">
                <a href="/">
                  <Home className="h-4 w-4" />
                  Return to Search
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
