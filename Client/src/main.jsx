import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import RegisterContractor from "./pages/RegisterContractor";
import ViewMyContractors from "./pages/ViewMyContractors";
import ContractorProfile from "./pages/ContractorProfile";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // This is the wrapper, it contains Navbar, and the Outlet for nested routes
    children: [
      {
        path: "/",
        element: <Home />, // This shows the Home component when at path "/"
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/registerContractor",
        element: (<PrivateRoute>
          <RegisterContractor/>
        </PrivateRoute>)
      },
      {
        path: "/viewMyContractors",
        element: (<PrivateRoute>
          <ViewMyContractors />
        </PrivateRoute>)
      },
      {
        path: "/contractorProfile",
        element: (<PrivateRoute>
          <ContractorProfile />
        </PrivateRoute>)
      },
      {
        path: "/profile",
        element: (<PrivateRoute>
          <ProfilePage/>
        </PrivateRoute>)
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
