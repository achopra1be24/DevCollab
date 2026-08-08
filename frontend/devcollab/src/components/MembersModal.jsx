import React from "react";

function MembersModal({

     isOpen,

    onClose,

    members,

    workspaceId,

    myRole,

    onMemberRemoved

}) {

    if (!isOpen) {

        return null;

    }
    console.log("My Role =", myRole);

    async function removeMember(userId) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/workspaces/${workspaceId}/members/${userId}`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (!response.ok) {

                alert("Unable to remove member");

                return;

            }

            onMemberRemoved();

        }

        catch (error) {

            console.log(error);

        }

    }

    return (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl p-8 w-[600px]">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-2xl font-bold">

                        Workspace Members

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-red-600 font-bold"

                    >

                        X

                    </button>

                </div>

                {

                    members.map(function(member){

                        return(

                            <div

                                key={member.id}

                                className="flex justify-between items-center border-b py-3"

                            >

                                <div>

                                    <p className="font-bold">

                                        {member.email}

                                    </p>

                                    <p className="text-gray-500">

                                        {member.role}

                                    </p>

                                </div>

                                {

                                    myRole === "Admin" && member.role !== "Admin" &&

                                    <button

                                        onClick={() => removeMember(member.id)}

                                        className="bg-red-500 text-white px-3 py-2 rounded"

                                    >

                                        Remove

                                    </button>

                                }

                            </div>

                        );

                    })

                }

            </div>

        </div>

    );

}

export default MembersModal;