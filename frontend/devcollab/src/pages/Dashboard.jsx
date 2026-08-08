import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import socket from "../socket";

function Dashboard() {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(function () {
        fetchWorkspaces();

        const handleWorkspaceUpdate = function () {
            console.log("⚡ Workspace update event received! Refreshing...");
            fetchWorkspaces();
        };

        socket.on(
            "workspace-updated",
            handleWorkspaceUpdate
        );

        return () => {
            socket.off(
                "workspace-updated",
                handleWorkspaceUpdate
            );
        };
    }, []);

    async function fetchWorkspaces() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/workspaces",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                alert("Please Login Again");
                navigate("/login");
                return;
            }

            const data = await response.json();
            setWorkspaces(data);
        }
        catch (error) {
            console.log(error);
            alert("Server Error");
        }
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        socket.disconnect();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
            {/* Top Navigation Bar - Enlarge Top Line */}
            <div className="bg-slate-900 text-white px-10 py-6 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-3xl shadow-sm">
                        DC
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        DevCollab
                    </h1>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => navigate("/notifications")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        Notifications
                    </button>

                    <button
                        onClick={logout}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Hero Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 px-10 shadow-inner">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="max-w-3xl">
                        <span className="bg-indigo-500/30 text-indigo-200 text-sm font-bold px-4 py-1.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                            Team Collaboration Platform
                        </span>
                        <h2 className="text-5xl font-black mt-4 tracking-tight leading-tight">
                            Manage & Build Projects Together
                        </h2>
                        <p className="text-indigo-200 text-lg mt-4 leading-relaxed font-normal">
                            DevCollab helps team members group tasks, coordinate project workflows, and communicate updates in real time. Create a workspace below to start organizing your team's project.
                        </p>
                    </div>

                    <button
                        onClick={function () {
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all text-lg flex items-center gap-3 whitespace-nowrap"
                    >
                        <span className="text-3xl leading-none font-light">+</span> Create New Workspace
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl w-full mx-auto px-8 py-10 flex-1">
                
                {/* Workspaces Section Header */}
                <div className="flex justify-between items-center pb-4 mb-8 border-b border-slate-300">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">
                            Your Workspaces
                        </h3>
                        <p className="text-slate-600 text-base mt-1">
                            Select a workspace board to view assigned tasks and team updates.
                        </p>
                    </div>
                </div>

                {/* Workspaces Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {
                        workspaces.map(function (workspace) {
                            return (
                                <div
                                    key={workspace.id}
                                    onClick={function () {
                                        navigate(`/workspaces/${workspace.id}`);
                                    }}
                                    className="bg-white border-t-4 border-t-indigo-600 rounded-xl border-x border-b border-slate-200 shadow-sm hover:shadow-md p-7 cursor-pointer transition flex flex-col justify-between min-h-[170px]"
                                >
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-800">
                                            {workspace.name}
                                        </h4>

                                        <p className="text-slate-600 mt-3 text-base leading-relaxed">
                                            {workspace.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-indigo-600 font-bold">
                                        <span>Open Workspace</span>
                                        <span className="text-base">→</span>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            <CreateWorkspaceModal
                isOpen={isModalOpen}
                onClose={function () {
                    setIsModalOpen(false);
                }}
                onWorkspaceCreated={fetchWorkspaces}
            />
        </div>
    );
}

export default Dashboard;