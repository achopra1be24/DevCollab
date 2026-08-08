import { useState } from "react";
import socket from "../socket"; // 1. Import socket instance

function CreateWorkspaceModal({

    isOpen,

    onClose,

    onWorkspaceCreated

}) {

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    async function createWorkspace(event) {

        event.preventDefault();

        if (!name) {

            alert("Workspace name is required");

            return;

        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                "http://localhost:5000/workspaces",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        name,

                        description

                    })

                }

            );

            const data = await response.text();

            if (!response.ok) {

                alert(data);

                return;

            }

            // 2. Notify clients to refresh dashboard workspaces list
            socket.emit("workspace-updated");

            alert("Workspace Created");

            setName("");

            setDescription("");

            onWorkspaceCreated();

            onClose();

        }

        catch (error) {

            console.log(error);

            alert("Server Error");

        }

    }

    if (!isOpen) {

        return null;

    }

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

            <div className="bg-white w-96 rounded-xl p-6 shadow-xl">

                <h2 className="text-2xl font-bold mb-6">

                    Create Workspace

                </h2>

                <form onSubmit={createWorkspace}>

                    <input

                        type="text"

                        placeholder="Workspace Name"

                        value={name}

                        onChange={(event) => setName(event.target.value)}

                        className="w-full border rounded-lg p-3 mb-4"

                    />

                    <textarea

                        placeholder="Description"

                        value={description}

                        onChange={(event) => setDescription(event.target.value)}

                        className="w-full border rounded-lg p-3 mb-6"

                    />

                    <div className="flex justify-end gap-3">

                        <button

                            type="button"

                            onClick={onClose}

                            className="px-5 py-2 border rounded-lg"

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="bg-blue-600 text-white px-5 py-2 rounded-lg"

                        >

                            Create

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default CreateWorkspaceModal;