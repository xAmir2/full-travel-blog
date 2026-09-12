import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Confirmation } from "../components/Confirmation";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  warning?: string;
  destructive?: boolean;
}

interface ConfirmationContextValue {
  requestConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
}

interface PendingConfirmation extends ConfirmationOptions {
  show: boolean;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(
  null,
);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  );
  
  // Stores the promise resolver until the user confirms or cancels
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  function requestConfirmation(options: ConfirmationOptions): Promise<boolean> {
    resolverRef.current?.(false);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;

      setConfirmation({
        ...options,
        show: true,
      });
    });
  }

  function finishConfirmation(confirmed: boolean) {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setConfirmation(null);
  }

  return (
    <ConfirmationContext.Provider value={{ requestConfirmation }}>
      {children}

      <Confirmation
        show={confirmation?.show ?? false}
        title={confirmation?.title ?? ""}
        message={confirmation?.message ?? ""}
        confirmLabel={confirmation?.confirmLabel ?? "Confirm"}
        warning={confirmation?.warning}
        destructive={confirmation?.destructive}
        isConfirming={false}
        onCancel={() => finishConfirmation(false)}
        onConfirm={() => finishConfirmation(true)}
      />
    </ConfirmationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmation(): ConfirmationContextValue {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error(
      "useConfirmation must be used inside ConfirmationProvider.",
    );
  }

  return context;
}
