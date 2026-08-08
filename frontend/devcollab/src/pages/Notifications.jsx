import { useEffect, useState } from "react";
import socket from "../socket";

function Notifications() {

    const [invitations, setInvitations] = useState([]);

    useEffect(() => {

        fetchInvitations();

        socket.on("new-invitation", function (invitation) {

            setInvitations(function (previous) {

                return [invitation, ...previous];

            });

        });

        return () => {

            socket.off("new-invitation");

        };

    }, []);

    async function fetchInvitations() {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                "http://localhost:5000/invitations/pending",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            setInvitations(data);

        }

        catch (error) {

            console.log(error);

        }

    }

    async function acceptInvitation(id) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/invitations/${id}/accept`,

                {

                    method: "PUT",

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (response.ok) {

                setInvitations(function (previous) {

                    return previous.filter(function (invitation) {

                        return invitation.id !== id;

                    });

                });

            }

        }

        catch (error) {

            console.log(error);

        }

    }

    async function rejectInvitation(id) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/invitations/${id}/reject`,

                {

                    method: "PUT",

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (response.ok) {

                setInvitations(function (previous) {

                    return previous.filter(function (invitation) {

                        return invitation.id !== id;

                    });

                });

            }

        }

        catch (error) {

            console.log(error);

        }

    }

    return (

        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-3xl font-bold mb-8">

                Notifications

            </h1>

            {

                invitations.length === 0 ?

                (

                    <p>No Pending Invitations</p>

                )

                :

                invitations.map(function (invitation) {

                    return (

                        <div

                            key={invitation.id}

                            className="bg-white shadow-lg rounded-xl p-5 mb-4"

                        >

                            <h2 className="text-xl font-bold">

                                {invitation.workspace_name}

                            </h2>

                            <p className="mt-2">

                                Invited by <b>{invitation.sender_name}</b>

                            </p>

                            <p className="text-gray-500">

                                {invitation.sender_email}

                            </p>

                            <div className="flex gap-3 mt-5">

                                <button

                                    onClick={() => acceptInvitation(invitation.id)}

                                    className="bg-green-600 text-white px-4 py-2 rounded"

                                >

                                    Accept

                                </button>

                                <button

                                    onClick={() => rejectInvitation(invitation.id)}

                                    className="bg-red-600 text-white px-4 py-2 rounded"

                                >

                                    Reject

                                </button>

                            </div>

                        </div>

                    );

                })

            }

        </div>

    );

}

export default Notifications;