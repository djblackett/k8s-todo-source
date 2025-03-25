/* eslint-disable no-unused-vars */
import React from "react";
import "./sass/index.scss";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals.js";
import { Provider } from "react-redux";
import store from "./features/app/store.js";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) {
  throw new Error("No container found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider >
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
