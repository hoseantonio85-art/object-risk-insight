export type RiskLevel = "high" | "medium" | "low" | "none";
export type AssessmentStatus = "actual" | "stale" | "progress" | "none";
export type EvaluationStatus = "ai-analysis" | "needs-review" | "actual" | "none";
export type ProductLifecycle = "planned" | "active" | "closed";
export type ObjectType = "product" | "counterparty" | "contract" | "ai-agent";
export type RiskType = "operational" | "behavior";

export interface ObjectItem {
  id: string;
  name: string;
  type: ObjectType;
  riskLevel: RiskLevel;
  status: AssessmentStatus;
  lastAssessment: string | null;
  description?: string;
  /** Product-specific fields */
  lifecycle?: ProductLifecycle;
  evaluationStatus?: EvaluationStatus;
}

export interface RiskItem {
  id: string;
  name: string;
  level: RiskLevel;
  manifestations: number;
  description: string;
  riskType: RiskType;
}

export interface RiskManifestation {
  riskId: string;
  objectId: string;
  level: RiskLevel;
  comment: string;
}

export interface AssessmentEntry {
  date: string;
  type: "AI" | "manual";
  level: RiskLevel;
}

export const lifecycleLabels: Record<ProductLifecycle, string> = {
  planned: "Планируемый",
  active: "Действующий",
  closed: "Закрыт",
};

export const evaluationStatusLabels: Record<EvaluationStatus, string> = {
  "ai-analysis": "AI анализ",
  "needs-review": "Анализ завершён",
  actual: "Оценка подтверждена",
  none: "Нет оценки",
};

export const objects: ObjectItem[] = [
  { id: "p1", name: "CRM Enterprise", type: "product", riskLevel: "high", status: "actual", lastAssessment: "2026-03-15", description: "Основная CRM-система для корпоративных клиентов", lifecycle: "active", evaluationStatus: "actual" },
  { id: "p2", name: "Мобильный банк 3.0", type: "product", riskLevel: "high", status: "stale", lastAssessment: "2026-01-20", description: "Мобильное приложение для розничных клиентов", lifecycle: "active", evaluationStatus: "needs-review" },
  { id: "p3", name: "Платёжный шлюз", type: "product", riskLevel: "medium", status: "actual", lastAssessment: "2026-03-10", description: "Шлюз обработки платежей", lifecycle: "active", evaluationStatus: "actual" },
  { id: "p4", name: "Внутренний портал", type: "product", riskLevel: "low", status: "actual", lastAssessment: "2026-03-12", description: "Портал для сотрудников компании", lifecycle: "active", evaluationStatus: "actual" },
  { id: "p5", name: "Data Lake", type: "product", riskLevel: "high", status: "progress", lastAssessment: "2026-02-28", description: "Централизованное хранилище данных", lifecycle: "active", evaluationStatus: "needs-review" },
  { id: "p6", name: "Цифровой вклад", type: "product", riskLevel: "none", status: "none", lastAssessment: null, description: "Новый депозитный продукт с гибкими условиями", lifecycle: "planned", evaluationStatus: "none" },
  { id: "p7", name: "Семейная подписка", type: "product", riskLevel: "none", status: "none", lastAssessment: null, description: "Пакетное предложение для семейных клиентов", lifecycle: "planned", evaluationStatus: "none" },
  { id: "c1", name: "ООО «ТехноСофт»", type: "counterparty", riskLevel: "high", status: "actual", lastAssessment: "2026-03-14", description: "Поставщик IT-инфраструктуры" },
  { id: "c2", name: "CloudServe Inc.", type: "counterparty", riskLevel: "medium", status: "stale", lastAssessment: "2025-12-01", description: "Облачный провайдер" },
  { id: "c3", name: "ИП Сидорова А.В.", type: "counterparty", riskLevel: "high", status: "actual", lastAssessment: "2026-03-18", description: "Консультант по безопасности" },
  { id: "d1", name: "Договор SLA-2024/117", type: "contract", riskLevel: "medium", status: "actual", lastAssessment: "2026-03-01", description: "SLA с основным облачным провайдером" },
  { id: "d2", name: "Лицензия Oracle DB", type: "contract", riskLevel: "low", status: "actual", lastAssessment: "2026-02-15", description: "Лицензионное соглашение на СУБД" },
  { id: "d3", name: "Договор аутсорсинга #42", type: "contract", riskLevel: "high", status: "none", lastAssessment: null, description: "Аутсорсинг разработки модуля аналитики" },
  { id: "a1", name: "Агент поддержки L1", type: "ai-agent", riskLevel: "medium", status: "actual", lastAssessment: "2026-03-17", description: "AI-агент первой линии поддержки" },
  { id: "a2", name: "Скоринг-модель v2", type: "ai-agent", riskLevel: "high", status: "progress", lastAssessment: "2026-03-19", description: "Модель кредитного скоринга" },
  { id: "a3", name: "Чат-бот HR", type: "ai-agent", riskLevel: "low", status: "actual", lastAssessment: "2026-03-05", description: "Внутренний HR-помощник" },
];

export const risks: RiskItem[] = [
  { id: "r1", name: "Утечка персональных данных", level: "high", manifestations: 4, description: "Риск несанкционированного доступа или утечки персональных данных клиентов и сотрудников. Включает риски, связанные с хранением, обработкой и передачей данных.", riskType: "operational" },
  { id: "r2", name: "Зависимость от поставщика", level: "medium", manifestations: 3, description: "Риск чрезмерной зависимости от одного поставщика технологий или услуг, что может привести к проблемам при смене или отказе поставщика.", riskType: "operational" },
  { id: "r3", name: "Нарушение комплаенс-требований", level: "high", manifestations: 2, description: "Риск несоответствия требованиям регуляторов, включая ФЗ-152, GDPR и отраслевые стандарты.", riskType: "operational" },
  { id: "r4", name: "Недоступность сервиса", level: "medium", manifestations: 3, description: "Риск длительной недоступности критичных сервисов из-за технических сбоев, DDoS-атак или проблем с инфраструктурой.", riskType: "operational" },
  { id: "r5", name: "Предвзятость AI-модели", level: "high", manifestations: 2, description: "Риск систематической ошибки или предвзятости в результатах работы AI-моделей, приводящей к дискриминации или некорректным решениям.", riskType: "operational" },
  { id: "r6", name: "Устаревание технологий", level: "low", manifestations: 2, description: "Риск использования устаревших технологий и фреймворков, что снижает безопасность и производительность.", riskType: "operational" },
  // Behavior risks
  { id: "br1", name: "Подключение без ведома клиента", level: "high", manifestations: 3, description: "Риск несанкционированного подключения клиентов к продуктам или услугам без их явного согласия. Включает автоматическую активацию подписок, платных опций или продуктов без подтверждения.", riskType: "behavior" },
  { id: "br2", name: "Недобросовестное раскрытие информации", level: "medium", manifestations: 2, description: "Риск недостаточного или вводящего в заблуждение раскрытия информации о продукте, включая условия, тарифы, ограничения и риски.", riskType: "behavior" },
  { id: "br3", name: "Навязывание продуктов", level: "low", manifestations: 1, description: "Риск навязывания дополнительных продуктов или услуг как обязательного условия для приобретения основного продукта.", riskType: "behavior" },
  { id: "br4", name: "Продажа неподходящего продукта", level: "high", manifestations: 2, description: "Риск продажи продуктов, не соответствующих потребностям, финансовому положению или уровню риска клиента.", riskType: "behavior" },
  { id: "br5", name: "Подмена продукта", level: "none", manifestations: 0, description: "Риск подмены продукта — предоставление клиенту продукта, отличного от запрошенного или согласованного, без надлежащего уведомления.", riskType: "behavior" },
];

export const manifestations: RiskManifestation[] = [
  { riskId: "r1", objectId: "p1", level: "high", comment: "Хранит данные 2М+ клиентов без шифрования в покое" },
  { riskId: "r1", objectId: "p2", level: "high", comment: "Мобильное приложение передаёт данные через устаревший API" },
  { riskId: "r1", objectId: "p5", level: "medium", comment: "Неконтролируемый доступ аналитиков к сырым данным" },
  { riskId: "r1", objectId: "c1", level: "medium", comment: "Доступ к production-данным без NDA" },
  { riskId: "r2", objectId: "c2", level: "medium", comment: "Единственный облачный провайдер, нет плана миграции" },
  { riskId: "r2", objectId: "d1", level: "medium", comment: "Lock-in через проприетарные API" },
  { riskId: "r2", objectId: "d2", level: "low", comment: "Высокая стоимость лицензии при отсутствии альтернатив" },
  { riskId: "r3", objectId: "p1", level: "high", comment: "Не пройден аудит ФЗ-152 за текущий год" },
  { riskId: "r3", objectId: "d3", level: "high", comment: "Аутсорсер не предоставил сертификаты соответствия" },
  { riskId: "r4", objectId: "p3", level: "medium", comment: "SLA 99.5%, целевой — 99.95%" },
  { riskId: "r4", objectId: "p2", level: "medium", comment: "3 инцидента недоступности за последний квартал" },
  { riskId: "r4", objectId: "c2", level: "medium", comment: "Не задокументирован план disaster recovery" },
  { riskId: "r5", objectId: "a2", level: "high", comment: "Обнаружена предвзятость по возрастному признаку" },
  { riskId: "r5", objectId: "a1", level: "medium", comment: "Нет тестирования на bias в ответах" },
  { riskId: "r6", objectId: "p4", level: "low", comment: "Используется jQuery и PHP 7.2" },
  { riskId: "r6", objectId: "c3", level: "low", comment: "Консультант не знаком с современными фреймворками" },
  // Behavior risk manifestations
  { riskId: "br1", objectId: "p1", level: "high", comment: "Автоматическая активация премиум-функций без подтверждения клиента при обновлении тарифа" },
  { riskId: "br1", objectId: "p2", level: "high", comment: "Push-уведомления о подключении платных опций с предвыбранным согласием" },
  { riskId: "br1", objectId: "p3", level: "medium", comment: "Автоматическое подключение страховки при проведении платежа свыше 50 000 ₽" },
  { riskId: "br2", objectId: "p1", level: "medium", comment: "Условия тарифа скрыты за ссылкой в футере, не видны при оформлении" },
  { riskId: "br2", objectId: "p2", level: "high", comment: "Комиссия за переводы не отображается до подтверждения операции" },
  { riskId: "br3", objectId: "p3", level: "low", comment: "При подключении шлюза обязательно оформление расчётного счёта" },
  { riskId: "br4", objectId: "p1", level: "high", comment: "CRM предлагает кредитные продукты клиентам с низким скорингом без предупреждения менеджера" },
  { riskId: "br4", objectId: "a2", level: "medium", comment: "Скоринг-модель не учитывает финансовую грамотность при рекомендации продуктов" },
];

export const assessmentHistory: Record<string, AssessmentEntry[]> = {
  p1: [
    { date: "2026-03-15", type: "AI", level: "high" },
    { date: "2026-01-10", type: "manual", level: "medium" },
    { date: "2025-11-05", type: "AI", level: "medium" },
  ],
  p2: [
    { date: "2026-01-20", type: "AI", level: "high" },
    { date: "2025-09-15", type: "manual", level: "high" },
  ],
  p3: [
    { date: "2026-03-10", type: "AI", level: "medium" },
    { date: "2025-12-20", type: "manual", level: "medium" },
  ],
  a2: [
    { date: "2026-03-19", type: "AI", level: "high" },
    { date: "2026-02-01", type: "manual", level: "medium" },
  ],
};

export const typeLabels: Record<ObjectType, string> = {
  product: "Продукт",
  counterparty: "Контрагент",
  contract: "Договор",
  "ai-agent": "AI-агент",
};

export const typePaths: Record<ObjectType, string> = {
  product: "products",
  counterparty: "counterparties",
  contract: "contracts",
  "ai-agent": "ai-agents",
};

export const riskTypeLabels: Record<RiskType, string> = {
  operational: "Операционный",
  behavior: "Поведенческий",
};

export function getObjectsByType(type: ObjectType) {
  return objects.filter((o) => o.type === type);
}

export function getManifestationsForObject(objectId: string) {
  return manifestations
    .filter((m) => m.objectId === objectId)
    .map((m) => ({ ...m, risk: risks.find((r) => r.id === m.riskId)! }));
}

export function getManifestationsForRisk(riskId: string) {
  return manifestations
    .filter((m) => m.riskId === riskId)
    .map((m) => ({ ...m, object: objects.find((o) => o.id === m.objectId)! }));
}

export function getRisksByType(riskType?: RiskType) {
  if (!riskType) return risks;
  return risks.filter((r) => r.riskType === riskType);
}
