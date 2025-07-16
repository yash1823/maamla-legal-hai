import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  layout?: "inline" | "card" | "fullscreen";
  variant?: "dots" | "spinner" | "pulse";
  className?: string;
}

// Pulsing dots animation component
function PulsingDots({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            dotSizes[size],
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}

// Pulse animation for card content
function PulseBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-md" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function EnhancedLoader({
  message = "Loading...",
  size = "md",
  layout = "card",
  variant = "spinner",
  className,
}: LoadingProps) {
  const sizes = {
    sm: { spinner: "h-4 w-4", text: "text-sm" },
    md: { spinner: "h-6 w-6", text: "text-base" },
    lg: { spinner: "h-8 w-8", text: "text-lg" },
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <PulsingDots size={size} />;
      case "pulse":
        return (
          <PulseBackground className="w-full h-8 rounded-md">
            <div className="flex items-center justify-center h-full">
              <span className={cn("text-muted-foreground", sizes[size].text)}>
                {message}
              </span>
            </div>
          </PulseBackground>
        );
      default:
        return (
          <Loader2
            className={cn("animate-spin text-primary", sizes[size].spinner)}
          />
        );
    }
  };

  // Layout variants
  switch (layout) {
    case "inline":
      return (
        <div className={cn("flex items-center gap-2", className)}>
          {renderLoader()}
          <span className={cn("text-muted-foreground", sizes[size].text)}>
            {message}
          </span>
        </div>
      );

    case "fullscreen":
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center min-h-[50vh] space-y-4",
            className,
          )}
        >
          {renderLoader()}
          <p
            className={cn(
              "text-muted-foreground text-center max-w-md",
              sizes[size].text,
            )}
          >
            {message}
          </p>
        </div>
      );

    default: // card
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-8 space-y-4",
            className,
          )}
        >
          {renderLoader()}
          <p
            className={cn(
              "text-muted-foreground text-center",
              sizes[size].text,
            )}
          >
            {message}
          </p>
        </div>
      );
  }
}

// Specialized loading components for specific contexts
export function SearchLoader({ query }: { query?: string }) {
  return (
    <EnhancedLoader
      message={
        query ? `Searching for "${query}"...` : "Searching legal cases..."
      }
      size="md"
      layout="fullscreen"
      variant="spinner"
    />
  );
}

export function CaseDetailLoader() {
  return (
    <EnhancedLoader
      message="Loading case details..."
      size="lg"
      layout="fullscreen"
      variant="spinner"
    />
  );
}

export function SummarizationLoader() {
  return (
    <EnhancedLoader
      message="Analyzing case content and generating summary..."
      size="md"
      layout="card"
      variant="dots"
    />
  );
}

export function RelevanceLoader({ query }: { query?: string }) {
  const message = query
    ? `Analyzing relevance to "${query}"...`
    : "Analyzing legal relevance...";

  return (
    <EnhancedLoader
      message={message}
      size="sm"
      layout="inline"
      variant="dots"
    />
  );
}

export function BookmarkLoader({ action }: { action: "add" | "remove" }) {
  return (
    <EnhancedLoader
      message={action === "add" ? "Saving bookmark..." : "Removing bookmark..."}
      size="sm"
      layout="inline"
      variant="spinner"
    />
  );
}

export function AuthLoader({
  action,
}: {
  action: "login" | "signup" | "checking";
}) {
  const messages = {
    login: "Signing you in...",
    signup: "Creating your account...",
    checking: "Verifying your session...",
  };

  return (
    <EnhancedLoader
      message={messages[action]}
      size="md"
      layout="card"
      variant="spinner"
    />
  );
}
