import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  );
}
