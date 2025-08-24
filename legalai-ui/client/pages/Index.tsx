import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Scale } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSection, FilterValues } from "@/components/FilterSection";
import { ResultsList } from "@/components/ResultsList";
import { UserMenu } from "@/components/UserMenu";
import { searchCases } from "@/lib/api";
import type { CaseResult, SearchRequest, PaginationInfo } from "@shared/api";

const initialFilters: FilterValues = {
  courtTypes: [],
  year: "",
  maxCitations: "",
  title: "",
  author: "",
  bench: "",
};

// Cache structure for pagination results
interface SearchCache {
  [searchKey: string]: {
    pages: { [page: number]: CaseResult[] };
    pagination: PaginationInfo | null;
    filters: FilterValues;
  };
}

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const searchCache = useRef<SearchCache>({});

  // Generate cache key for current search + filters
  const generateSearchKey = (query: string, searchFilters: FilterValues): string => {
    return JSON.stringify({ query: query.trim(), filters: searchFilters });
  };

  // Check if page is cached for current search
  const isPageCached = (page: number): boolean => {
    const searchKey = generateSearchKey(searchQuery, filters);
    return !!(searchCache.current[searchKey]?.pages[page]);
  };

  // Get cached page data
  const getCachedPage = (page: number): { results: CaseResult[]; pagination: PaginationInfo | null } | null => {
    const searchKey = generateSearchKey(searchQuery, filters);
    const cached = searchCache.current[searchKey];
    if (cached?.pages[page]) {
      return {
        results: cached.pages[page],
        pagination: cached.pagination,
      };
    }
    return null;
  };

  // Cache page data
  const cachePage = (page: number, pageResults: CaseResult[], paginationInfo: PaginationInfo | null) => {
    const searchKey = generateSearchKey(searchQuery, filters);
    if (!searchCache.current[searchKey]) {
      searchCache.current[searchKey] = {
        pages: {},
        pagination: paginationInfo,
        filters,
      };
    }
    searchCache.current[searchKey].pages[page] = pageResults;
    searchCache.current[searchKey].pagination = paginationInfo;
  };

  // Clear cache when search query or filters change
  const clearCacheForSearch = () => {
    const searchKey = generateSearchKey(searchQuery, filters);
    delete searchCache.current[searchKey];
  };

  // Restore search state from navigation state or localStorage
  useEffect(() => {
    // First check navigation state (higher priority)
    if (location.state?.searchState) {
      const {
        searchQuery: prevQuery,
        filters: prevFilters,
        results: prevResults,
        pagination: prevPagination,
        hasSearched: prevHasSearched,
        currentPage: prevCurrentPage = 0,
      } = location.state.searchState;
      setSearchQuery(prevQuery);
      setFilters(prevFilters);
      setResults(prevResults);
      setPagination(prevPagination || null);
      setHasSearched(prevHasSearched);
      setCurrentPage(prevCurrentPage);
    } else {
      // Try to restore from localStorage
      try {
        const savedState = localStorage.getItem("searchState");
        if (savedState) {
          const {
            searchQuery: prevQuery,
            filters: prevFilters,
            results: prevResults,
            pagination: prevPagination,
            hasSearched: prevHasSearched,
          } = JSON.parse(savedState);
          setSearchQuery(prevQuery || "");
          setFilters(prevFilters || initialFilters);
          setResults(prevResults || []);
          setPagination(prevPagination || null);
          setHasSearched(prevHasSearched || false);
        }
      } catch (error) {
        console.log("Failed to restore search state:", error);
      }
    }

    // Handle scroll to top after login/signup or by default
    const shouldScrollToTop =
      location.state?.scrollToSearch || !location.state?.searchState;

    if (shouldScrollToTop) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);

      // Clear the scroll flag from location state if it exists
      if (location.state?.scrollToSearch) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [location.state]);

  const handleSearch = async (page: number = 0) => {
    if (!searchQuery.trim()) return;

    // If it's a new search (page 0), clear the cache
    if (page === 0) {
      clearCacheForSearch();
      setCurrentPage(0);
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Check cache first
      if (isPageCached(page)) {
        const cached = getCachedPage(page);
        if (cached) {
          setResults(cached.results);
          setPagination(cached.pagination);
          setCurrentPage(page);
          setIsLoading(false);
          return;
        }
      }

      const searchParams: SearchRequest = {
        query: searchQuery.trim(),
        page,
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
      const newResults = response.cases || [];

      // Cache the results
      cachePage(page, newResults, response.pagination || null);

      setResults(newResults);
      setPagination(response.pagination || null);
      setCurrentPage(page);

      // Save search state to localStorage
      const searchState = {
        searchQuery: searchQuery.trim(),
        filters,
        results: newResults,
        pagination: response.pagination || null,
        hasSearched: true,
        currentPage: page,
      };
      localStorage.setItem("searchState", JSON.stringify(searchState));
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching",
      );
      setResults([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate handler for page changes that uses cache when possible
  const handlePageChange = async (page: number) => {
    if (!searchQuery.trim()) return;

    // Check if page is already cached
    if (isPageCached(page)) {
      const cached = getCachedPage(page);
      if (cached) {
        setResults(cached.results);
        setPagination(cached.pagination);
        setCurrentPage(page);

        // Update localStorage with current page
        const searchState = {
          searchQuery: searchQuery.trim(),
          filters,
          results: cached.results,
          pagination: cached.pagination,
          hasSearched: true,
          currentPage: page,
        };
        localStorage.setItem("searchState", JSON.stringify(searchState));
        return;
      }
    }

    // If not cached, fetch from API
    await handleSearch(page);
  };

  const handleViewDetails = (docid: string) => {
    // Pass current search state so it can be restored on back navigation
    navigate(`/case/${docid}`, {
      state: {
        searchState: {
          searchQuery,
          filters,
          results,
          pagination,
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
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg flex-shrink-0">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  Maamla Legal Hai
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Search Indian legal cases and judgments
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  Legal case search
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <section ref={searchSectionRef} className="space-y-4 sm:space-y-6">
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
            pagination={pagination}
            isLoading={isLoading}
            error={error}
            searchQuery={hasSearched ? searchQuery : ""}
            onViewDetails={handleViewDetails}
            onPageChange={handleSearch}
          />
        </section>
      </main>

      <footer className="border-t bg-card/30 mt-8 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            <p>
              © 2025 Maamla Legal Hai. Search Indian legal cases and judgments.
            </p>
            <p className="mt-2 hidden sm:block">
              This platform provides access to legal information for research
              and educational purposes.
            </p>
            <p className="mt-2 sm:hidden">
              Legal information for research purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
