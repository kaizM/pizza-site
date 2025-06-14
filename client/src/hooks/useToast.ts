import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

const toasts: Toast[] = [];
let count = 0;

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>(toasts);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = (++count).toString();
    const newToast: Toast = {
      ...props,
      id,
    };

    toasts.push(newToast);
    setToastList([...toasts]);

    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        toasts.splice(index, 1);
        setToastList([...toasts]);
      }
    }, 5000);

    return {
      id,
      dismiss: () => {
        const index = toasts.findIndex((t) => t.id === id);
        if (index !== -1) {
          toasts.splice(index, 1);
          setToastList([...toasts]);
        }
      },
    };
  }, []);

  return {
    toast,
    toasts: toastList,
  };
}
