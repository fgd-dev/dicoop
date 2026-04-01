import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorMessageProvider } from "./ErrorMessage/ErrorMessageContext";
import "./index.css";

// import i18n (needs to be bundled ;))
import "./i18n";
import { MantineProvider } from "@mantine/core";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Suspense fallback={<div>DICOOP is loading...</div>}>
      <MantineProvider
        theme={{
          primaryColor: "dark",
        }}
      >
        <ErrorMessageProvider>
          <App />
        </ErrorMessageProvider>
      </MantineProvider>
    </Suspense>
  </React.StrictMode>
);