import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateBoardModal from "../components/CreateBoardModal";
import MembersModal from "../components/MembersModal";
import socket from "../socket";

function Workspace() {
    const navigate = useNavigate();
    const { workspaceId } = useParams();

    const [boards, setBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [showMembers, setShowMembers] = useState(false);
    const [myRole, setMyRole] = useState("");

    useEffect(function () {
        if (!workspaceId) return;

        fetchBoards();
        fetchMembers();

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit("join-workspace", String(workspaceId));

        const handleWorkspaceUpdate = function () {
            fetchBoards();
            fetchMembers();
        };

        socket.on("workspace-updated", handleWorkspaceUpdate);

        return function () {
            socket.emit("leave-workspace", String(workspaceId));
            socket.off("workspace-updated", handleWorkspaceUpdate);

            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [workspaceId]);

    async function fetchBoards() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/workspaces/${workspaceId}/boards`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                alert("Unable to fetch boards");
                navigate("/dashboard");
                return;
            }

            const data = await response.json();
            setBoards(data);
        }
        catch (error) {
            console.log(error);
            alert("Server Error");
        }
    }

    async function fetchMembers() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/workspaces/${workspaceId}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setMembers(data.members);
            setMyRole(data.myRole);
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
            {/* Top Navigation Bar */}
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
                        onClick={function () {
                            navigate("/dashboard");
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* Hero Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 px-10 shadow-inner">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="max-w-3xl">
                        <span className="bg-indigo-500/30 text-indigo-200 text-sm font-bold px-4 py-1.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                            Project Hub
                        </span>
                        <h2 className="text-5xl font-black mt-4 tracking-tight leading-tight">
                            Project Boards & Workflows
                        </h2>
                        <p className="text-indigo-200 text-lg mt-4 leading-relaxed font-normal">
                            Manage your workspace boards, organize ongoing tasks, and collaborate with team members in real time. Select or create a board to start planning.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <button
                            onClick={() => setShowMembers(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-7 py-4 rounded-xl shadow-lg transition-all text-lg border border-slate-700"
                        >
                            Members
                        </button>

                        {myRole !== "Viewer" && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all text-lg flex items-center gap-3 whitespace-nowrap"
                            >
                                <span className="text-3xl leading-none font-light">+</span> Create Board
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl w-full mx-auto px-8 py-10 flex-1">
                
                {/* Boards Section Header */}
                <div className="flex justify-between items-center pb-4 mb-8 border-b border-slate-300">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">
                            Workspace Boards
                        </h3>
                        <p className="text-slate-600 text-base mt-1">
                            Select a board to view, organize, and update team tasks.
                        </p>
                    </div>
                </div>

                {/* Boards Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {
                        boards.map(function (board) {
                            return (
                                <div
                                    key={board.id}
                                    onClick={function () {
                                        navigate(`/boards/${board.id}`);
                                    }}
                                    className="bg-white border-t-4 border-t-indigo-600 rounded-xl border-x border-b border-slate-200 shadow-sm hover:shadow-md p-7 cursor-pointer transition flex flex-col justify-between min-h-[150px]"
                                >
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-800">
                                            {board.name}
                                        </h4>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-indigo-600 font-bold">
                                        <span>Open Board</span>
                                        <span className="text-base">→</span>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            <CreateBoardModal
                isOpen={isModalOpen}
                onClose={function () {
                    setIsModalOpen(false);
                }}
                workspaceId={workspaceId}
                onBoardCreated={fetchBoards}
            />

            <MembersModal
                isOpen={showMembers}
                onClose={function () {
                    setShowMembers(false);
                }}
                members={members}
                myRole={myRole}
                workspaceId={workspaceId}
                onMemberRemoved={fetchMembers}
            />
        </div>
    );
}

export default Workspace;