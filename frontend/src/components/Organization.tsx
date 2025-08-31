import axios from "axios";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Organization = () => {
  const location = useLocation();
  const organization = location.state as Record<string, any>;
  const [options, setOptions] = useState({
    boards: false,
    participants: false,
    details: false,
  });
  const user = localStorage.getItem("currentUser");
  let user_id = null;
  if (user !== null) {
    user_id = JSON.parse(user).id;
  }
  const [boards, setBoards] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);

  const handleBoards = async () => {
    const response = await axios.get(
      `http://localhost:8000/organization/get_all_boards?organization_id=${organization.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data) {
      setBoards(response.data);
      console.log(boards);
      console.log(options.boards);
    }
  };

  const handleParticipants = async () => {
    const response = await axios.get(
      `http://localhost:8000/organization/get_all_participants?organization_id=${organization.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data) {
      setParticipants(response.data);
      console.log(participants);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="border-2 p-5 m-2">
        <h1 className="w-full font-bold text-2xl mb-5">{organization.title}</h1>
        <nav>
          <div className="flex v-screen justify-between p-1 border-2">
            <button
              onClick={() => {
                handleBoards(),
                  setOptions({
                    boards: true,
                    participants: false,
                    details: false,
                  });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Boards
            </button>
            <p>|</p>
            <button
              onClick={() => {
                handleParticipants(),
                  setOptions({
                    boards: false,
                    participants: true,
                    details: false,
                  });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Participants
            </button>
            <p>|</p>

            <button
              onClick={() => {
                setOptions({
                  boards: false,
                  participants: false,
                  details: true,
                });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Details
            </button>
          </div>
        </nav>
        <div>
          {options.boards &&
            boards.map((board) => (
              <div
                key={board.id}
                className="font-bold flex mt-2 justify-between items-center border-2 p-2"
              >
                {board.title}
                <div className="flex flex-col justify-between">
                  <button
                    onClick={() => console.log("Acessing the board")}
                    className="bg-green-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-green-950 cursor-pointer"
                  >
                    Enter the board
                  </button>
                  {board.creator_id === user_id && (
                    <button className="bg-red-700 pl-4 pr-4 pt-2 pb-2 text-white hover:bg-red-950 cursor-pointer">
                      Delete the board
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
        <div>
          {options.participants &&
            participants.map((participant) => (
              <div
                className="flex v-screen mt-2 justify-between p-1"
                key={participant.id}
              >
                <h1>{participant.username}</h1>
                <h1>
                  Since {new Date(participant.created_at).toLocaleDateString()}
                </h1>
              </div>
            ))}
        </div>
        <div>
          {options.details && (
            <h1>
              Created at:{" "}
              {new Date(organization.created_at).toLocaleDateString()}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
