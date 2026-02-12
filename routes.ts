import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./components/Dashboard";
import { SwotInput } from "./components/SwotInput";
import { CldBuilder } from "./components/CldBuilder";
import { ArchetypesLibrary } from "./components/ArchetypesLibrary";
import { StrategicOptions } from "./components/StrategicOptions";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "swot-input", Component: SwotInput },
      { path: "cld-builder", Component: CldBuilder },
      { path: "archetypes", Component: ArchetypesLibrary },
      { path: "strategic-options", Component: StrategicOptions },
      { path: "*", Component: NotFound },
    ],
  },
]);
