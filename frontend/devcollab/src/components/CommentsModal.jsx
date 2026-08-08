import { useEffect, useState } from "react";
import socket from "../socket";
function CommentsModal({

    isOpen,
    onClose,
    taskId

}) {

    const [comments, setComments] = useState([]);

    const [comment, setComment] = useState("");
    const currentUserId = Number(localStorage.getItem("userId"));

   useEffect(() => {

    if (!isOpen || !taskId) return;

    fetchComments();

    socket.on(

        "comments-updated",

        fetchComments

    );

    return () => {

        socket.off(

            "comments-updated",

            fetchComments

        );

    };

}, [isOpen, taskId]);



    async function fetchComments() {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/tasks/${taskId}/comments`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (!response.ok) return;

            const data = await response.json();

            setComments(data);

        }

        catch (error) {

            console.log(error);

        }

    }



    async function addComment() {

        if (!comment.trim()) return;

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/tasks/${taskId}/comments`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        comment

                    })

                }

            );

            if (response.ok) {

                setComment("");

                fetchComments();

            }

            else {

                const msg = await response.text();

                alert(msg);

            }

        }

        catch (error) {

            console.log(error);

        }

    }



    async function deleteComment(commentId) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(

                `http://localhost:5000/comments/${commentId}`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (response.ok) {

                fetchComments();

            }

        }

        catch (error) {

            console.log(error);

        }

    }



    if (!isOpen) return null;



    return (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

            <div className="bg-white w-[700px] rounded-xl p-6 max-h-[85vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-2xl font-bold">

                        Task Comments

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-red-600 font-bold"

                    >

                        X

                    </button>

                </div>



                <div className="space-y-4">

                    {

                        comments.map((commentItem) => (

                            <div

                                key={commentItem.id}

                                className="border rounded-lg p-3"

                            >

                                <div className="flex justify-between items-center">

                                    <h3 className="font-semibold">

                                        {commentItem.name}

                                    </h3>

                               {
                                  commentItem.user_id === currentUserId && (

                                  <button onClick={() => deleteComment(commentItem.id)}
                                  className="text-red-500">
                                  Delete
                                  </button>

                                )
                                }

                                </div>

                                <p className="mt-2">

                                    {commentItem.comment}

                                </p>

                            </div>

                        ))

                    }

                </div>



                <div className="mt-6 flex gap-3">

                    <input

                        type="text"

                        value={comment}

                        onChange={(e) => setComment(e.target.value)}

                        placeholder="Write a comment..."

                        className="flex-1 border rounded-lg px-4 py-2"

                    />

                    <button

                        onClick={addComment}

                        className="bg-blue-600 text-white px-5 rounded-lg"

                    >

                        Send

                    </button>

                </div>

            </div>

        </div>

    );

}

export default CommentsModal;