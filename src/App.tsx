import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ModalStackProvider } from "@/contexts/ModalStackContext";
import { ModalStack } from "@/components/ModalStack";
import HomePage from "@/pages/HomePage";
import ObjectsOverview from "@/pages/ObjectsOverview";
import ObjectList from "@/pages/ObjectList";
import RisksList from "@/pages/RisksList";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Не изменять этот блок: специфическая настройка basename для GitHub Pages
const isGitHubPages = window.location.hostname.includes("github.io");
const basename = isGitHubPages ? "/object-risk-insight" : "";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <ModalStackProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/objects" element={<ObjectsOverview />} />
              <Route path="/objects/products" element={<ObjectList objectType="product" />} />
              <Route path="/objects/counterparties" element={<ObjectList objectType="counterparty" />} />
              <Route path="/objects/contracts" element={<ObjectList objectType="contract" />} />
              <Route path="/objects/ai-agents" element={<ObjectList objectType="ai-agent" />} />
              <Route path="/risks" element={<RisksList />} />
              <Route path="/measures" element={<PlaceholderPage title="Меры" />} />
              <Route path="/incidents" element={<PlaceholderPage title="Инциденты" />} />
              <Route path="/analytics" element={<PlaceholderPage title="Аналитика" />} />
              <Route path="/knowledge" element={<PlaceholderPage title="База знаний" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ModalStack />
        </ModalStackProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
