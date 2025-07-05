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
  fromDate: string;
  toDate: string;
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
    filters.fromDate ||
    filters.toDate ||
    filters.maxCitations ||
    filters.title ||
    filters.author ||
    filters.bench;

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-6 h-auto font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>Advanced Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Court Types */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Court Types</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 border rounded-md bg-muted/30">
                  {COURT_TYPES.map((court) => (
                    <div key={court} className="flex items-center space-x-2">
                      <Checkbox
                        id={court}
                        checked={filters.courtTypes.includes(court)}
                        onCheckedChange={() => toggleCourtType(court)}
                      />
                      <Label
                        htmlFor={court}
                        className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {court}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="fromDate"
                      className="text-xs text-muted-foreground"
                    >
                      From Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="fromDate"
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) =>
                          updateFilter("fromDate", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="toDate"
                      className="text-xs text-muted-foreground"
                    >
                      To Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="toDate"
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => updateFilter("toDate", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Additional Filters
                </Label>
                <div className="space-y-3">
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
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
