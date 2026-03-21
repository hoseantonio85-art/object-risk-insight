import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ModalEntry =
  | { type: "object"; id: string }
  | { type: "risk"; id: string };

interface ModalStackContextType {
  stack: ModalEntry[];
  openObject: (id: string) => void;
  openRisk: (id: string) => void;
  closeTop: () => void;
  closeAll: () => void;
}

const ModalStackContext = createContext<ModalStackContextType | null>(null);

export function ModalStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalEntry[]>([]);

  const openObject = useCallback((id: string) => {
    setStack((prev) => [...prev, { type: "object", id }]);
  }, []);

  const openRisk = useCallback((id: string) => {
    setStack((prev) => [...prev, { type: "risk", id }]);
  }, []);

  const closeTop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const closeAll = useCallback(() => {
    setStack([]);
  }, []);

  return (
    <ModalStackContext.Provider value={{ stack, openObject, openRisk, closeTop, closeAll }}>
      {children}
    </ModalStackContext.Provider>
  );
}

export function useModalStack() {
  const ctx = useContext(ModalStackContext);
  if (!ctx) throw new Error("useModalStack must be used within ModalStackProvider");
  return ctx;
}
