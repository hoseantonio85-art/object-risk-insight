import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardCheck,
  BarChart3,
  ShieldAlert,
  Shield,
  AlertTriangle,
  BookOpen,
  Package,
  Users,
  FileText,
  Bot,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const objectSubItems = [
  { title: "Обзор", path: "/objects", icon: LayoutDashboard },
  { title: "Продукты", path: "/objects/products", icon: Package },
  { title: "Контрагенты", path: "/objects/counterparties", icon: Users },
  { title: "Договоры", path: "/objects/contracts", icon: FileText },
  { title: "AI-агенты", path: "/objects/ai-agents", icon: Bot },
];

const mainItems = [
  { title: "Главная", path: "/", icon: Home },
];

const bottomItems = [
  { title: "Риски", path: "/risks", icon: ShieldAlert },
  { title: "Меры", path: "/measures", icon: Shield },
  { title: "Инциденты", path: "/incidents", icon: AlertTriangle },
  { title: "Аналитика", path: "/analytics", icon: BarChart3 },
  { title: "База знаний", path: "/knowledge", icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isObjectsSection = location.pathname.startsWith("/objects");
  const [objectsOpen, setObjectsOpen] = useState(isObjectsSection);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
      isActive(path)
        ? "bg-accent text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    );

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <h1 className="text-base font-semibold text-foreground tracking-tight">RiskBoard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainItems.map((item) => (
          <div key={item.path} className={linkClass(item.path)} onClick={() => navigate(item.path)}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
        ))}

        {/* Objects section */}
        <div>
          <div
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
              isObjectsSection
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => {
              setObjectsOpen(!objectsOpen);
              if (!isObjectsSection) navigate("/objects");
            }}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-4 w-4" />
              <span>Оценка объектов</span>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", objectsOpen && "rotate-180")} />
          </div>

          {objectsOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
              {objectSubItems.map((item) => (
                <div key={item.path} className={linkClass(item.path)} onClick={() => navigate(item.path)}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 space-y-1">
          {bottomItems.map((item) => (
            <div key={item.path} className={linkClass(item.path)} onClick={() => navigate(item.path)}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
