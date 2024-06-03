import React from "react";
import App from "./views/App";

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <App/>
    </React.Suspense>
  );
}
