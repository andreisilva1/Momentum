import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./components/User";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Organization from "./components/Organization";
import CreateOrganization from "./components/CreateOrganization";
import CreateBoard from "./components/CreateBoard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/organization" element={<Organization />}></Route>
        <Route
          path="/organization/create"
          element={<CreateOrganization />}
        ></Route>
        <Route path="/board/create" element={<CreateBoard />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
