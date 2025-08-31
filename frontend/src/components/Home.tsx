import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [organizations, setOrganizations] = useState([]);
  const navigate = useNavigate();
  const handleOrganization = async (organization: any) => {
    navigate("/organization", { state: organization });
  };
  useEffect(() => {
    const get_organizations = async () => {
      const organizations = await axios.get(
        "http://localhost:8000/organization/get_all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (organizations.data) {
        setOrganizations(organizations.data);
      }
    };
    get_organizations();
  }, []);
  return (
    <div>
      <NavBar />
      <div className="w-[30vw] m-2 h-screen pr-2 border-r-2">
        <div className="flex flex-col justify-center items-center">
          <h1
            className="font-bold text-2xl mb-2 mx-auto"
            style={{
              width: "29vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Organizations
          </h1>
          <button
            className="font-bold text-white bg-green-700 pl-4 pr-4 pb-2 pt-2 mb-2 rounded-lg mx-auto hover:bg-green-950 cursor-pointer"
            style={{
              width: "25vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Create a new organization
          </button>
        </div>
        <hr className="mb-2" />
        {organizations.map((organization: any) => (
          <li
            className="font-bold text-sm hover:opacity-85 cursor-pointer"
            style={{
              width: "30vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() => handleOrganization(organization)}
            key={organization.id}
          >
            {organization.title}
          </li>
        ))}
      </div>
    </div>
  );
};

export default Home;
