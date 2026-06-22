import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Login } from "./pages/Login.tsx";
import { ProjectDetails } from "./pages/ProjectDetails.tsx";
import { TeacherDashboard } from "./pages/TeacherDashboard.tsx";
import { ChangePassword } from "./pages/ChangePassword.tsx";

export const router = createBrowserRouter(
  [
    {
      path: "/login",
      Component: Login,
    },
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: Dashboard },
        { path: "project/:id", Component: ProjectDetails },
        { path: "teacher", Component: TeacherDashboard },
        { path: "mudar-senha", Component: ChangePassword },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
