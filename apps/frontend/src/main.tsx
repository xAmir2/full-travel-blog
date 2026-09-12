import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ConfirmationProvider } from "./context/ConfirmationContext";
import { ThemeProvider } from "./context/ThemeProvider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <ConfirmationProvider>
        <App />
      </ConfirmationProvider>
    </AuthProvider>
  </ThemeProvider>,
);
