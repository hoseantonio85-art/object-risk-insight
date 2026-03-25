import type { ProductLifecycle } from "@/data/mock";

export interface DetectedProduct {
  id: string;
  name: string;
  lifecycle: ProductLifecycle;
  sourceHint: string;
  description?: string;
}

export const detectedProducts: DetectedProduct[] = [
  {
    id: "dp-1",
    name: "SmartPay Lite",
    lifecycle: "active",
    sourceHint: "Найден в документах",
    description: "Сервис быстрых платежей для малого бизнеса. Поддерживает оплату по QR-коду, через NFC и интернет-эквайринг. Интеграция с кассовым ПО и бухгалтерскими системами.",
  },
  {
    id: "dp-3",
    name: "Кэшбэк Плюс",
    lifecycle: "active",
    sourceHint: "Найден в анализе",
    description: "Программа лояльности с возвратом средств на карту. Включает категории повышенного кэшбэка, партнёрские акции и персональные предложения на основе истории покупок.",
  },
];
