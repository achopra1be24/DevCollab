import { useEffect, useState } from "react";
import socket from "../socket";
function ActivityModal({

    isOpen,
    onClose,
    boardId

}) {

    const [activities, setActivities] = useState([]);

    useEffect(() => {

    if (!isOpen) return;

    fetchActivities();

    socket.on(

        "activities-updated",

        fetchActivities

    );

    return () => {

        socket.off(

            "activities-updated",

            fetchActivities

        );

    };

}, [isOpen]);

    async function fetchActivities() {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/boards/${boardId}/activities`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (!response.ok) return;

            const data = await response.json();

            setActivities(data);

        }

        catch (error) {

            console.log(error);

        }

    }

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-[700px] max-h-[80vh] overflow-hidden">

                <div className="flex justify-between items-center border-b px-6 py-4">

                    <h2 className="text-2xl font-semibold">

                        Activity Timeline

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-gray-500 hover:text-red-500"

                    >

                        ✕

                    </button>

                </div>

                <div className="overflow-y-auto max-h-[70vh]">

                    {

                        activities.length === 0 ?

                        (

                            <div className="text-center py-10 text-gray-500">

                                No activity yet

                            </div>

                        )

                        :

                        (

                            activities.map((activity) => (

                                <div

                                    key={activity.id}

                                    className="border-b px-6 py-4 hover:bg-gray-50 transition"

                                >

                                    <div className="flex justify-between">

                                        <div>

                                            <p className="font-semibold">

                                                {activity.name}

                                            </p>

                                            <p className="text-gray-700 mt-1">

                                                {activity.action}

                                            </p>
                                        </div>

                                        <div className="text-sm text-gray-400">

                                            {

                                                new Date(

                                                    activity.created_at

                                                ).toLocaleString()

                                            }

                                        </div>

                                    </div>

                                </div>

                            ))

                        )

                    }

                </div>

            </div>

        </div>

    );

}

export default ActivityModal;