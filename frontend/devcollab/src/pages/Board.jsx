import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DndContext,
         DragOverlay,
         closestCorners } from "@dnd-kit/core";

import CreateListModal from "../components/CreateListModal";
import InviteMemberModal from "../components/InviteMemberModal";
import List from "../components/List";
import CommentsModal from "../components/CommentsModal";
import ActivityModal from "../components/ActivityModal";
import socket from "../socket";

function Board() {
    const navigate = useNavigate();
    const { boardId } = useParams();

    const [lists, setLists] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showActivity, setShowActivity] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");

    // Fetch Board & Tasks
    async function fetchBoard() {
        try {
            const token = localStorage.getItem("token");

            // 1. Fetch lists
            const res = await fetch(`http://localhost:5000/boards/${boardId}/lists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const listsData = await res.json();

            // 2. Fetch tasks for all lists
            const listsWithTasks = await Promise.all(
                listsData.map(async (list) => {
                    const taskRes = await fetch(`http://localhost:5000/lists/${list.id}/tasks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const tasks = taskRes.ok ? await taskRes.json() : [];
                    return { ...list, tasks };
                })
            );

            // 3. Update state
            setLists(listsWithTasks);
        } catch (err) {
            toast.error("Error loading board");
        }
    }

    // Real-Time Socket Connection & Listening
    useEffect(() => {
        if (!boardId) return;

        fetchBoard();

        // Connect socket & Join Room
        if (!socket.connected) socket.connect();
        socket.emit("join-board", String(boardId));

        // Handler for real-time updates
        const handleUpdate = () => {
            console.log("⚡ Real-time change detected! Syncing...");
            fetchBoard();
        };

        // Listen to updates broadcast from server
        socket.on("board-updated", handleUpdate);
        socket.on("comments-updated", handleUpdate);

        // Cleanup
        return () => {
            socket.emit("leave-board", String(boardId));
            socket.off("board-updated", handleUpdate);
        };
    }, [boardId]);

    const filteredLists = useMemo(() => {
        return lists.map((list) => ({
            ...list,
            tasks: list.tasks.filter((task) => {
                const matchesSearch = task.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

                const matchesPriority =
                    priorityFilter === "All"
                        ? true
                        : task.priority === priorityFilter;

                return matchesSearch && matchesPriority;
            })
        }));
    }, [lists, searchQuery, priorityFilter]);

    const stats = useMemo(() => {
        const allTasks = lists.flatMap(list => list.tasks);

        const today = new Date();
        today.setHours(0,0,0,0);

        return {
            total: allTasks.length,
            pending: allTasks.length,
            overdue: allTasks.filter(task => {
                if(!task.due_date) return false;
                const due = new Date(task.due_date);
                due.setHours(0,0,0,0);
                return due < today;
            }).length,
            high: allTasks.filter(
                task => task.priority === "High"
            ).length
        };
    }, [lists]);

    function handleDragStart(event) {
        const taskId = event.active.id;
        for (const list of lists) {
            const task = list.tasks.find(
                t => String(t.id) === String(taskId)
            );
            if (task) {
                setActiveTask(task);
                break;
            }
        }
    }

    function handleDragCancel() {
        setActiveTask(null);
    }

    // Handle Drag & Drop Task Moving
    async function handleDragEnd(event) {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;
        if (active.id === over.id) return;

        const sourceList = lists.find(list =>
            list.tasks.some(task => String(task.id) === String(active.id))
        );

        const destinationList = lists.find(list =>
            String(list.id) === String(over.id) ||
            list.tasks.some(task => String(task.id) === String(over.id))
        );

        if (!sourceList || !destinationList) return;

        const sourceIndex = sourceList.tasks.findIndex(
            task => String(task.id) === String(active.id)
        );

        let destinationIndex = destinationList.tasks.findIndex(
            task => String(task.id) === String(over.id)
        );

        if (destinationIndex === -1) {
            destinationIndex = destinationList.tasks.length;
        }

        // ---------- Optimistic UI ----------
        const updatedLists = lists.map(list => ({
            ...list,
            tasks: [...list.tasks]
        }));

        const fromList = updatedLists.find(
            l => l.id === sourceList.id
        );

        const toList = updatedLists.find(
            l => l.id === destinationList.id
        );

        const [movedTask] = fromList.tasks.splice(sourceIndex, 1);
        toList.tasks.splice(destinationIndex, 0, movedTask);

        setLists(updatedLists);

        // ---------- Save to Backend ----------
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/tasks/${active.id}/move`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        destinationListId: destinationList.id,
                        newPosition: destinationIndex + 1
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Move failed");
            }

            socket.emit("board-updated", String(boardId));
        } catch (error) {
            toast.error("Move failed");
            fetchBoard();
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
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                            DevCollab
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Manage your projects beautifully.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setShowActivity(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-lg font-semibold transition flex items-center gap-2"
                    >
                        <span>📈</span> Activity
                    </button>

                    <button
                        onClick={() => setIsInviteOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        + Invite
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* Main Board Content */}
            <div className="max-w-7xl w-full mx-auto px-8 py-10 flex-1">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
                        <p className="text-sm font-semibold text-slate-500">
                            Total Tasks
                        </p>
                        <h2 className="text-4xl font-black mt-2 text-indigo-600">
                            {stats.total}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
                        <p className="text-sm font-semibold text-slate-500">
                            Pending
                        </p>
                        <h2 className="text-4xl font-black mt-2 text-blue-600">
                            {stats.pending}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
                        <p className="text-sm font-semibold text-slate-500">
                            Overdue
                        </p>
                        <h2 className="text-4xl font-black mt-2 text-rose-600">
                            {stats.overdue}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
                        <p className="text-sm font-semibold text-slate-500">
                            High Priority
                        </p>
                        <h2 className="text-4xl font-black mt-2 text-amber-500">
                            {stats.high}
                        </h2>
                    </div>
                </div>

                {/* Filter and Create Controls */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">
                                Your Board
                            </h2>
                            <p className="text-slate-500 text-base mt-1">
                                Organize, track and finish your work.
                            </p>
                        </div>

                        <div className="flex gap-4 flex-wrap items-center">
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-5 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-64 bg-slate-50"
                            />

                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="px-5 py-3 text-base rounded-xl border border-slate-300 bg-slate-50 font-medium"
                            >
                                <option value="All">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white font-bold px-7 py-3 rounded-xl text-base flex items-center gap-2"
                            >
                                <span className="text-xl leading-none font-light">+</span> Create List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lists Drag and Drop Area */}
                <DndContext 
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragCancel={handleDragCancel}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex items-start gap-8 overflow-x-auto pb-6 px-2">
                        {filteredLists.map((list) => (
                            <List
                                key={list.id}
                                list={list}
                                boardId={boardId}
                                tasks={list.tasks || []}
                                refreshBoard={fetchBoard}
                                onOpenComments={function(taskId){
                                    setSelectedTask(taskId);
                                    setShowComments(true);
                                }}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask && (
                            <div className="bg-white rounded-xl shadow-2xl p-5 w-72 opacity-95 border-2 border-indigo-500">
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {activeTask.title}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {activeTask.description}
                                </p>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Modals */}
            <CreateListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                boardId={boardId}
                onListCreated={() => {
                    socket.emit("board-updated", String(boardId));
                    fetchBoard();
                }}
            />

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                workspaceId={boardId}
            />

            <CommentsModal
                isOpen={showComments}
                onClose={function(){
                    setShowComments(false);
                }}
                taskId={selectedTask}
            />

            <ActivityModal
                isOpen={showActivity}
                onClose={() => setShowActivity(false)}
                boardId={boardId}
            />
        </div>
    );
}

export default Board;