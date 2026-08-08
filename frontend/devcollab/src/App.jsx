import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import Notifications from "./pages/Notifications";

const router = createBrowserRouter([

    {

        path: "/",

        element: <Login />

    },

    {

        path: "/login",

        element: <Login />

    },

    {

        path: "/signup",

        element: <Signup />

    },

    {

        path: "/dashboard",

        element: <Dashboard />

    },

    {

        path: "/workspaces/:workspaceId",

        element: <Workspace />

    },

    {

        path: "/boards/:boardId",

        element: <Board />

    },
    {
    path: "/notifications",
    element: <Notifications />
    }

]);

function App() {

    return <RouterProvider router={router} />;

}

export default App;