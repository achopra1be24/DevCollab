import { useState } from "react";
import { toast } from "react-toastify";
import socket from "../socket"; // 1. Import socket instance

function InviteMemberModal({ isOpen, onClose, workspaceId, onMemberAdded }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Member");

    if (!isOpen) return null;

    async function handleInvite(e) {
        e.preventDefault();

        if (!email.trim()) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/invitations/${workspaceId}/send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ email, role })
                }
            );

            const data = await response.text();

            if (!response.ok) {
                toast.error(data);
                return;
            }

            // 2. Notify connected users to refresh workspace state/members
            socket.emit("workspace-updated");

            toast.success("Member added to workspace!");
            setEmail("");
            if (onMemberAdded) onMemberAdded();
            onClose();
        } catch (error) {
            console.log(error);
            toast.error("Server Error");
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>

                <form onSubmit={handleInvite}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">User Email</label>
                        <input
                            type="email"
                            required
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        >
                            <option value="Member">Member (Can edit tasks)</option>
                            <option value="Viewer">Viewer (Read-only)</option>
                        </select>
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
                            Send Invite
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InviteMemberModal;