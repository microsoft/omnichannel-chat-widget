import React from "react";
import { createRoot } from "react-dom/client";
import OmnichannelWidget from "./OmnichannelWidget";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <OmnichannelWidget />
  </React.StrictMode>
);