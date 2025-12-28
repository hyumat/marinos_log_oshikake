import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Marinos Away Log
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your Yokohama F. Marinos match attendance and viewing history.
              Always get the latest match information with accurate web scraping.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Auto Match Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically fetch the latest match information from the official J.League website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Viewing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track win/loss records, total matches attended, and expenses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Detailed Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Record notes, ticket costs, stadiums, and other details for each match.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Multi-Device Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access from smartphone, tablet, or PC. Data syncs automatically across devices.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for logged-in users
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your Marinos match information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Log</CardTitle>
              <CardDescription>Manage match information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/matches')}
                className="w-full"
              >
                View Matches
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>View statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/statistics')}
                variant="outline"
                className="w-full"
              >
                View Stats
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>User settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="w-full"
              >
                Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
