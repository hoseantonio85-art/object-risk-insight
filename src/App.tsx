import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import ObjectsOverview from "@/pages/ObjectsOverview";
import ObjectList from "@/pages/ObjectList";
import ObjectDetail from "@/pages/ObjectDetail";
import RisksList from "@/pages/RisksList";
import RiskDetail from "@/pages/RiskDetail";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// LOVABLE_KEEP_START
// Не изменять этот блок: специфическая настройка basename для GitHub Pages
const isGitHubPages = window.location.hostname.includes("github.io");
const basename = isGitHubPages ? "/object-guard-pulse" : "";
// LOVABLE_KEEP_END

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* LOVABLE_KEEP_START */}
      <BrowserRouter basename={basename}>
      {/* LOVABLE_KEEP_END */}
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/objects" element={<ObjectsOverview />} />
            <Route path="/objects/products" element={<ObjectList objectType="product" />} />
            <Route path="/objects/products/:id" element={<ObjectDetail />} />
            <Route path="/objects/counterparties" element={<ObjectList objectType="counterparty" />} />
            <Route path="/objects/counterparties/:id" element={<ObjectDetail />} />
            <Route path="/objects/contracts" element={<ObjectList objectType="contract" />} />
            <Route path="/objects/contracts/:id" element={<ObjectDetail />} />
            <Route path="/objects/ai-agents" element={<ObjectList objectType="ai-agent" />} />
            <Route path="/objects/ai-agents/:id" element={<ObjectDetail />} />
            <Route path="/risks" element={<RisksList />} />
            <Route path="/risks/:id" element={<RiskDetail />} />
            <Route path="/measures" element={<PlaceholderPage title="Меры" />} />
            <Route path="/incidents" element={<PlaceholderPage title="Инциденты" />} />
            <Route path="/analytics" element={<PlaceholderPage title="Аналитика" />} />
            <Route path="/knowledge" element={<PlaceholderPage title="База знаний" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
