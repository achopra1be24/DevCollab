import { useState } from "react";
import { toast } from "react-toastify";
import socket from "../socket"; // 1. Import socket instance

function CreateTaskModal({ isOpen, onClose, listId, boardId, onTaskCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Low");
    const [dueDate, setDueDate] = useState("");

    if (!isOpen) return null;

    async function handleCreateTask(e) {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/lists/${listId}/tasks`, {
                method: "POST",
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

            // 2. Notify all members viewing this board that a new task was added
            if (boardId) {
                socket.emit("board-updated", { boardId });
            }

            setTitle("");
            setDescription("");
            setPriority("Low");
            setDueDate("");

            toast.success("Task Created Successfully!");
            onTaskCreated();
            onClose();
        } catch (error) {
            console.log(error);
            toast.error("Server Error");
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Create New Task</h2>

                <form onSubmit={handleCreateTask}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter task title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            placeholder="Enter task description..."
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
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTaskModal;