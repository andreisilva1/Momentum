import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./components/User";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Organization from "./components/Organization";
import CreateOrganization from "./components/CreateOrganization";
import CreateBoard from "./components/CreateBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import Board from "./components/Board";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <Organization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/create"
          element={
            <ProtectedRoute>
              <CreateOrganization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board/create"
          element={
            <ProtectedRoute>
              <CreateBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
