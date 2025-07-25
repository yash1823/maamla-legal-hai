import { useState } from "react";
import { Calendar, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export interface FilterValues {
  courtTypes: string[];
  year: string; // or number
  maxCitations: string;
  title: string;
  author: string;
  bench: string;
}

interface FilterSectionProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onClear: () => void;
}

const COURT_TYPES = [
  "Supreme Court of India",
  "Delhi High Court",
  "Mumbai High Court",
  "Chennai High Court",
  "Calcutta High Court",
  "Karnataka High Court",
  "Allahabad High Court",
  "Rajasthan High Court",
  "Gujarat High Court",
  "Bombay High Court",
  "Madras High Court",
  "Kerala High Court",
  "Andhra Pradesh High Court",
  "Telangana High Court",
  "Orissa High Court",
  "Madhya Pradesh High Court",
  "Patna High Court",
  "Gauhati High Court",
  "Punjab and Haryana High Court",
  "Himachal Pradesh High Court",
  "Uttarakhand High Court",
  "Jharkhand High Court",
  "Chhattisgarh High Court",
  "Tripura High Court",
  "Manipur High Court",
  "Meghalaya High Court",
  "Sikkim High Court",
];

export function FilterSection({
  filters,
  onChange,
  onClear,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleCourtType = (courtType: string) => {
    const newCourtTypes = filters.courtTypes.includes(courtType)
      ? filters.courtTypes.filter((ct) => ct !== courtType)
      : [...filters.courtTypes, courtType];
    updateFilter("courtTypes", newCourtTypes);
  };

  const hasActiveFilters =
    filters.courtTypes.length > 0 ||
    filters.year ||
    filters.maxCitations ||
    filters.title ||
    filters.author ||
    filters.bench;

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 sm:p-6 h-auto font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Advanced Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Court Types */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium">
                  Court Types
                </Label>
                <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-2 p-2 sm:p-3 border rounded-md bg-muted/30">
                  {COURT_TYPES.map((court) => (
                    <div key={court} className="flex items-center space-x-2">
                      <Checkbox
                        id={court}
                        checked={filters.courtTypes.includes(court)}
                        onCheckedChange={() => toggleCourtType(court)}
                      />
                      <Label
                        htmlFor={court}
                        className="text-xs sm:text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {court}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium">Year</Label>
                <div>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 2017"
                    value={filters.year}
                    onChange={(e) => updateFilter("year", e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium">
                  Additional Filters
                </Label>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <Label
                      htmlFor="maxCitations"
                      className="text-xs text-muted-foreground"
                    >
                      Max Citations
                    </Label>
                    <Input
                      id="maxCitations"
                      type="number"
                      placeholder="e.g., 100"
                      value={filters.maxCitations}
                      onChange={(e) =>
                        updateFilter("maxCitations", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-xs text-muted-foreground"
                    >
                      Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Case title..."
                      value={filters.title}
                      onChange={(e) => updateFilter("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="author"
                      className="text-xs text-muted-foreground"
                    >
                      Author/Judge
                    </Label>
                    <Input
                      id="author"
                      type="text"
                      placeholder="Judge name..."
                      value={filters.author}
                      onChange={(e) => updateFilter("author", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="bench"
                      className="text-xs text-muted-foreground"
                    >
                      Bench
                    </Label>
                    <Input
                      id="bench"
                      type="text"
                      placeholder="Bench details..."
                      value={filters.bench}
                      onChange={(e) => updateFilter("bench", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
