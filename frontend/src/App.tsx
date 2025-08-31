import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./components/User";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Organization from "./components/Organization";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/organization" element={<Organization />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
