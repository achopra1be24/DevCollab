import { useState } from "react";
import socket from "../socket"; // 1. Import socket instance

function CreateBoardModal({

    isOpen,

    onClose,

    workspaceId,

    onBoardCreated

}) {

    const [name, setName] = useState("");

    async function createBoard(event) {

        event.preventDefault();

        if (!name.trim()) {

            alert("Board name is required");

            return;

        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/workspaces/${workspaceId}/boards`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        name: name.trim()

                    })

                }

            );

            const data = await response.text();

            if (!response.ok) {

                alert(data);

                return;

            }

            // 2. Notify other members in this workspace that a new board was created
            socket.emit("workspace-updated", { workspaceId });

            alert("Board Created Successfully");

            setName("");

            onBoardCreated();

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

                    Create Board

                </h2>

                <form onSubmit={createBoard}>

                    <input

                        type="text"

                        placeholder="Board Name"

                        value={name}

                        onChange={function (event) {

                            setName(event.target.value);

                        }}

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

export default CreateBoardModal;