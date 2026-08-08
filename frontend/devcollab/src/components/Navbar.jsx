import { useNavigate } from "react-router-dom";
import socket from "../socket"; // 1. Import socket instance

function Navbar({

    title,

    showBack = false

}) {

    const navigate = useNavigate();

    function logout() {

        // 2. Cleanly disconnect socket connection on logout
        if (socket.connected) {
            socket.disconnect();
        }

        localStorage.removeItem("token");

        navigate("/login");

    }

    return (

        <div className="bg-blue-600 text-white px-10 py-5 flex justify-between items-center">

            <div className="flex items-center gap-4">

                {

                    showBack && (

                        <button

                            onClick={function () {

                                navigate(-1);

                            }}

                            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200"

                        >

                            Back

                        </button>

                    )

                }

                <h1 className="text-3xl font-bold">

                    {title}

                </h1>

            </div>

            <button

                onClick={logout}

                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"

            >

                Logout

            </button>

        </div>

    );

}

export default Navbar;