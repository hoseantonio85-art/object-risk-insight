import type { ProductLifecycle } from "@/data/mock";

export interface DetectedProduct {
  id: string;
  name: string;
  lifecycle: ProductLifecycle;
  sourceHint: string;
}

export const detectedProducts: DetectedProduct[] = [
  {
    id: "dp-1",
    name: "SmartPay Lite",
    lifecycle: "active",
    sourceHint: "Найден в документах",
  },
  {
    id: "dp-2",
    name: "Инвест-Консалт",
    lifecycle: "planned",
    sourceHint: "Найден в анализе",
  },
];
