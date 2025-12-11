import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Endereco from "./pages/Endereco";
import Frete from "./pages/Frete";
import Home from "./pages/Home";
import Loading from "./pages/Loading";
import Pagamento from "./pages/Pagamento";
import Parabens from "./pages/Parabens";
import Produto from "./pages/Produto";
import Quiz from "./pages/Quiz";
import Start from "./pages/Start";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Start} />
      <Route path={"/quiz"} component={Quiz} />
      <Route path={"/loading"} component={Loading} />
      <Route path={"/home"} component={Home} />
      <Route path={"/parabens"} component={Parabens} />
      <Route path={"/produto/:id"} component={Produto} />
      <Route path={"/endereco"} component={Endereco} />
      <Route path={"/frete"} component={Frete} />
      <Route path={"/pagamento"} component={Pagamento} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
