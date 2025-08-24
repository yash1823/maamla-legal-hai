import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedLoader } from "@/components/ui/enhanced-loader";
import { InfoTooltip } from "./InfoTooltip";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Search legal cases, laws, judgments...",
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-center">
          <span className="sm:hidden">Search Cases</span>
          <span className="hidden sm:inline">Search Legal Cases</span>
        </h2>
        <InfoTooltip
          content={
            <div className="space-y-2">
              <p>
                <strong>Search Tips:</strong>
              </p>
              <ul className="text-xs space-y-1">
                <li>• Use specific legal terms or case names</li>
                <li>• Try "contract breach" or "criminal appeal"</li>
                <li>• Use filters below to narrow results</li>
                <li>• Quotation marks for exact phrases</li>
              </ul>
            </div>
          }
        />
      </div>
      <div className="relative flex flex-col sm:flex-row w-full max-w-4xl mx-auto gap-2 sm:gap-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-base sm:text-lg border-2 border-border focus:border-primary transition-colors"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={() => onSearch()}
          disabled={isLoading || !value.trim()}
          size="lg"
          className="sm:ml-3 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium w-full sm:w-auto"
        >
          {isLoading ? (
            <EnhancedLoader
              message="Searching..."
              size="sm"
              layout="inline"
              variant="spinner"
              className="text-primary-foreground"
            />
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </div>
  );
}
