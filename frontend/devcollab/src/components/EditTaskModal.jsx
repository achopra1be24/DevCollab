import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import socket from "../socket"; // 1. Import socket instance

function EditTaskModal({ isOpen, onClose, task, boardId, onTaskUpdated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Low");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setPriority(task.priority || "Low");
            setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
        }
    }, [task]);

    if (!isOpen) return null;

    async function handleUpdateTask(e) {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    dueDate: dueDate || null
                })
            });

            if (!response.ok) {
                const data = await response.text();
                toast.error(data);
                return;
            }

            // 2. Notify other connected users on this board to refresh
            if (boardId) {
                socket.emit("board-updated", { boardId });
            }

            toast.success("Task Updated Successfully!");
            onTaskUpdated();
            onClose();
        } catch (error) {
            console.log(error);
            toast.error("Server Error");
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Edit Task</h2>

                <form onSubmit={handleUpdateTask}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 px-4 py-2 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTaskModal;