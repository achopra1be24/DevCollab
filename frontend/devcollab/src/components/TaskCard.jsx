import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import EditTaskModal from "./EditTaskModal";

function TaskCard({ task, boardId, onTaskUpdated, onOpenComments }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: String(task.id)
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 1000 : "auto"
    };

    // ---------------- Priority Colors ----------------
    const priorityColor = {
        High: "bg-rose-50 text-rose-700 border border-rose-200",
        Medium: "bg-amber-50 text-amber-700 border border-amber-200",
        Low: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    };

    // ---------------- Due Date ----------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dueBadge = null;

    if (task.due_date) {
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);

        const diff = Math.floor(
            (due - today) / (1000 * 60 * 60 * 24)
        );

        if (diff < 0) {
            dueBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    🔥 Overdue
                </span>
            );
        } else if (diff === 0) {
            dueBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    ⏰ Today
                </span>
            );
        } else if (diff === 1) {
            dueBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                    🌤 Tomorrow
                </span>
            );
        } else {
            dueBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    📅{" "}
                    {new Date(task.due_date).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric"
                        }
                    )}
                </span>
            );
        }
    }

    // ---------------- Delete Task ----------------
    async function deleteTask() {
        const confirmDelete = window.confirm("Delete this task?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/tasks/${task.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                alert(await response.text());
                return;
            }

            onTaskUpdated();
        } catch (error) {
            console.log(error);
            alert("Server Error");
        }
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    hover:shadow-md
                    transition-all
                    duration-200
                    overflow-hidden
                "
            >
                {/* Accent Line */}
                <div
                    className={`h-1.5 ${
                        task.priority === "High"
                            ? "bg-rose-500"
                            : task.priority === "Medium"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                    }`}
                />

                <div className="p-5">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-slate-400 text-xs font-semibold tracking-wide uppercase mb-3 flex items-center gap-1 select-none hover:text-slate-600 transition"
                    >
                        ☰ Drag to Move
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 mt-1 min-h-[36px] line-clamp-2">
                        {task.description || "No additional details..."}
                    </p>

                    {/* Priority + Due Badge */}
                    <div className="flex justify-between items-center mt-4 pt-2">
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColor[task.priority]}`}
                        >
                            {task.priority}
                        </span>

                        {dueBadge}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center">
                        <button
                            onClick={() => onOpenComments(task.id)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5"
                        >
                            💬 Discussion
                        </button>

                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    text-xs
                                    font-semibold
                                    bg-slate-100
                                    text-slate-700
                                    hover:bg-slate-200
                                    transition-all
                                "
                            >
                                ✏ Edit
                            </button>

                            <button
                                onClick={deleteTask}
                                className="
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    text-xs
                                    font-semibold
                                    bg-rose-50
                                    text-rose-600
                                    hover:bg-rose-600
                                    hover:text-white
                                    transition-all
                                "
                            >
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={task}
                boardId={boardId}
                onTaskUpdated={onTaskUpdated}
            />
        </>
    );
}

export default TaskCard;