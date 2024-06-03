import React from "react";
import App from "./App";

export default function Home() {
  return (
    <React.Suspense fallback={<div>Chargement...</div>}>
      <App/>
    </React.Suspense>
  );
}
