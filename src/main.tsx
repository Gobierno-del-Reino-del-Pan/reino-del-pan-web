import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";

import App from "./App";
import "./index.css";
import { MasaAuthProvider } from "../context/MasaAuthContext";

window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MasaAuthProvider>
      <App />
    </MasaAuthProvider>
  </React.StrictMode>,
);