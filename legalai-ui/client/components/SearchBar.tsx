import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <h2 className="text-xl font-semibold text-center">
          Search Legal Cases
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
      <div className="relative flex w-full max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-12 pr-4 py-6 text-lg border-2 border-border focus:border-primary transition-colors"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={isLoading || !value.trim()}
          size="lg"
          className="ml-3 px-8 py-6 text-lg font-medium"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
}
