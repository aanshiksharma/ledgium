import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./state/store.js";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate
      loading={
        <div className="h-screen bg-neutral-950 text-neutral-300 flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      }
      persistor={persistor}
    >
      <StrictMode>
        <App />
      </StrictMode>
    </PersistGate>
  </Provider>
);
