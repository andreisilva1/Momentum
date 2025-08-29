import { useLocation } from "react-router-dom";

const Profile = () => {
  const location = useLocation();
  const data = location.state?.data;
  return (
    <div>
      <h1>Username: {data.username}</h1>
      <h1>Email: {data.email}</h1>
    </div>
  );
};

export default Profile;
