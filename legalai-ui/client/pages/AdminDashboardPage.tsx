import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDbDebugStats, getUsersDebugStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  Bookmark,
  Search,
  Database,
  AlertTriangle,
  Shield,
  UserCheck,
  Crown,
  RefreshCw,
} from "lucide-react";
import type {
  DbDebugResponse,
  UsersDebugResponse,
  CaseMetaEntry,
  RecentUser,
  TopUserByBookmarks,
} from "@shared/api";

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State for data
  const [dbData, setDbData] = useState<DbDebugResponse | null>(null);
  const [usersData, setUsersData] = useState<UsersDebugResponse | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [docidFilter, setDocidFilter] = useState("");

  // Check admin token and auth status
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!adminToken) {
      setError("Admin access required. Admin token not found.");
      setIsLoading(false);
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [dbResponse, usersResponse] = await Promise.all([
        getDbDebugStats(),
        getUsersDebugStats(),
      ]);

      setDbData(dbResponse);
      setUsersData(usersResponse);
    } catch (err: any) {
      console.error("Failed to load admin dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilteredSearch = async () => {
    if (!docidFilter.trim()) {
      loadDashboardData();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const dbResponse = await getDbDebugStats(docidFilter.trim());
      setDbData(dbResponse);
    } catch (err: any) {
      console.error("Failed to filter by docid:", err);
      setError(err.message || "Failed to filter data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setDocidFilter("");
    loadDashboardData();
  };

  // Show unauthorized access if no admin token
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (error && error.includes("Admin access required")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">
              Unauthorized Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have admin privileges to access this dashboard.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Badge variant="secondary" className="ml-2">
                {user?.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Filter by Document ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter document ID to filter..."
                value={docidFilter}
                onChange={(e) => setDocidFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilteredSearch()}
              />
              <Button onClick={handleFilteredSearch} disabled={isLoading}>
                Filter
              </Button>
              {docidFilter && (
                <Button variant="outline" onClick={handleRefresh}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Case Stats Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Case Stats Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : dbData ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Case Meta
                        </p>
                        <p className="text-2xl font-bold">
                          {dbData.stats.total_case_meta_rows.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Null Summaries
                        </p>
                        <p className="text-2xl font-bold">
                          {dbData.stats.null_summaries.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Bookmark className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Bookmarks
                        </p>
                        <p className="text-2xl font-bold">
                          {dbData.stats.total_bookmarks.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Users with Bookmarks
                        </p>
                        <p className="text-2xl font-bold">
                          {dbData.stats.users_with_bookmarks.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </section>

        {/* Recent Case Meta Entries */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Recent Case Meta Entries
          </h2>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : dbData?.recent_entries.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Query</TableHead>
                      <TableHead>Modified Query</TableHead>
                      <TableHead>Summary Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dbData.recent_entries.map(
                      (entry: CaseMetaEntry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {entry.docid}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.query}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.modified_query}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={entry.summary ? "default" : "secondary"}
                            >
                              {entry.summary ? "Has Summary" : "No Summary"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No recent entries found
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* User Stats Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Stats Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : usersData ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold">
                          {usersData.stats.total_users.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Users without Bookmarks
                        </p>
                        <p className="text-2xl font-bold">
                          {usersData.stats.users_without_bookmarks.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Duplicate Emails
                        </p>
                        <p className="text-2xl font-bold">
                          {usersData.stats.duplicate_emails.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </section>

        {/* Recent Users and Top Users Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : usersData?.recent_users.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.recent_users.map((user: RecentUser) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm">
                            {user.id}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No recent users found
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Top Users by Bookmarks */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Top Users by Bookmarks
            </h2>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : usersData?.top_users_by_bookmarks.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Bookmarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.top_users_by_bookmarks.map(
                        (user: TopUserByBookmarks, index) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                {index < 3 && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {user.bookmark_count}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No users with bookmarks found
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
