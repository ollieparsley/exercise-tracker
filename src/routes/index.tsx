import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { Log } from "./Log";
import { History } from "./History";
import { Settings } from "./Settings";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/log",
      element: <Log />,
    },
    {
      path: "/history",
      element: <History />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
  ],
  {
    basename: "/exercise-tracker",
  }
);
