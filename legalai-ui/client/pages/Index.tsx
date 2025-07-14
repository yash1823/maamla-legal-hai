import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Scale } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSection, FilterValues } from "@/components/FilterSection";
import { ResultsList } from "@/components/ResultsList";
import { UserMenu } from "@/components/UserMenu";
import { searchCases } from "@/lib/api";
import type { CaseResult, SearchRequest } from "@shared/api";

const initialFilters: FilterValues = {
  courtTypes: [],
  year: "",
  maxCitations: "",
  title: "",
  author: "",
  bench: "",
};

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Restore search state from navigation state
  useEffect(() => {
    if (location.state?.searchState) {
      const {
        searchQuery: prevQuery,
        filters: prevFilters,
        results: prevResults,
        hasSearched: prevHasSearched,
      } = location.state.searchState;
      setSearchQuery(prevQuery);
      setFilters(prevFilters);
      setResults(prevResults);
      setHasSearched(prevHasSearched);
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchParams: SearchRequest = {
        query: searchQuery.trim(),
        page: 0,
      };

      const filtersPayload: any = {};

      if (filters.courtTypes.length > 0) {
        filtersPayload.doctypes = filters.courtTypes
          .map((court) => courtTypeMap[court])
          .filter(Boolean)
          .join(",");
      }

      if (filters.year) {
        const parsedYear = parseInt(filters.year, 10);
        if (!isNaN(parsedYear)) {
          filtersPayload.year = parsedYear;
        }
      }

      if (filters.maxCitations) {
        filtersPayload.maxcites = parseInt(filters.maxCitations, 10);
      }

      if (filters.title) {
        filtersPayload.title = filters.title;
      }

      if (filters.author) {
        filtersPayload.author = filters.author;
      }

      if (filters.bench) {
        filtersPayload.bench = filters.bench;
      }

      if (Object.keys(filtersPayload).length > 0) {
        searchParams.filters = filtersPayload;
      }

      const response = await searchCases(searchParams);
      setResults(response.cases || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching",
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (docid: string) => {
    // Pass current search state so it can be restored on back navigation
    navigate(`/case/${docid}`, {
      state: {
        searchState: {
          searchQuery,
          filters,
          results,
          hasSearched,
        },
      },
    });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const courtTypeMap: Record<string, string> = {
    "Supreme Court of India": "supremecourt",
    "Delhi High Court": "delhi",
    "Mumbai High Court": "bombay",
    "Chennai High Court": "chennai",
    "Calcutta High Court": "kolkata",
    "Karnataka High Court": "karnataka",
    "Allahabad High Court": "allahabad",
    "Rajasthan High Court": "rajasthan",
    "Gujarat High Court": "gujarat",
    "Bombay High Court": "bombay",
    "Madras High Court": "chennai",
    "Kerala High Court": "kerala",
    "Andhra Pradesh High Court": "andhra",
    "Telangana High Court": "telangana",
    "Orissa High Court": "orissa",
    "Madhya Pradesh High Court": "madhyapradesh",
    "Patna High Court": "patna",
    "Gauhati High Court": "gauhati",
    "Punjab and Haryana High Court": "punjab",
    "Himachal Pradesh High Court": "himachal_pradesh",
    "Uttarakhand High Court": "uttaranchal",
    "Jharkhand High Court": "jharkhand",
    "Chhattisgarh High Court": "chattisgarh",
    "Tripura High Court": "tripura",
    "Manipur High Court": "manipur",
    "Meghalaya High Court": "meghalaya",
    "Sikkim High Court": "sikkim",
  };

  function formatToKanoonDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />

          <FilterSection
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
          />
        </section>

        <section>
          <ResultsList
            results={results}
            isLoading={isLoading}
            error={error}
            searchQuery={hasSearched ? searchQuery : ""}
            onViewDetails={handleViewDetails}
          />
        </section>
      </main>

      <footer className="border-t bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © 2025 Maamla Legal Hai. Search Indian legal cases and judgments.
            </p>
            <p className="mt-2">
              This platform provides access to legal information for research
              and educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
