"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ReactNode } from "react";

// Export a function called Providers that takes in a prop called children
interface ProvidersProps {
  readonly children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Return a Provider component with the store prop set to the store variable and the children prop set to the children prop
  return <Provider store={store}>{children}</Provider>;
}
