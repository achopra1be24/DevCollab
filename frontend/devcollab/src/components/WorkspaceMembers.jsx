import React, { useEffect, useState } from "react";
import socket from "../socket"; // 1. Import socket instance

export default function WorkspaceMembers({ workspaceId }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/workspaces/${workspaceId}/members`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (err) {
            console.error("Failed to load members", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!workspaceId) return;

        fetchMembers();

        // 2. Join the workspace socket room
        socket.emit("join-workspace", workspaceId);

        // 3. Listen for member updates across the workspace
        const handleMemberAdded = () => {
            fetchMembers();
        };

        socket.on("member-added", handleMemberAdded);

        // 4. Cleanup socket subscription and room on unmount/id change
        return () => {
            socket.off("member-added", handleMemberAdded);
            socket.emit("leave-workspace", workspaceId);
        };
    }, [workspaceId]);

    if (loading) return <p>Loading team members...</p>;

    return (
        <div style={{ padding: "16px", background: "#fff", borderRadius: "8px" }}>
            <h3>Workspace Members ({members.length})</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {members.map((member) => (
                    <li key={member.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                        <span>{member.email}</span>
                        <strong style={{ color: member.role === 'Admin' ? '#2563eb' : '#6b7280' }}>
                            {member.role}
                        </strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}