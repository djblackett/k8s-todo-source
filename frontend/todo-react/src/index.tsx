/* eslint-disable no-unused-vars */
import React from "react";
import "./sass/index.scss";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./features/app/store.js";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const container = document.getElementById("root");
if (!container) {
  throw new Error("No container found");
}

const root = createRoot(container);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);
