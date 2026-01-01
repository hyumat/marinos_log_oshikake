import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Stats from "./pages/Stats";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import Upgrade from "./pages/Upgrade";
import Pricing from "./pages/Pricing";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* LP */}
      <Route path={"/"} component={Landing} />

      {/* App */}
      <Route path={"/app"} component={Home} />
      <Route path={"/matches"} component={Matches} />
      <Route path={"/matches/:id"} component={MatchDetail} />
      <Route path={"/stats"} component={Stats} />

      {/* Legal & Support */}
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/support"} component={Support} />
      <Route path={"/upgrade"} component={Upgrade} />
      <Route path={"/pricing"} component={Pricing} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// ThemeProvider wraps the whole app.
// defaultTheme can be "light" or "dark".
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
