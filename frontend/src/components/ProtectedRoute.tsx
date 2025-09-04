import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const apiUrl = import.meta.env.VITE_API_URL;

export default function ProtectedRoute({ children }: Props) {
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("currentUser") ?? "null");
  useEffect(() => {
    const verifyUser = async () => {
      if (!user) {
        setIsValidUser(false);
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${apiUrl}/users/user?id=${user.id}`);
        console.log(response.status);
        if (response.status == 200) {
          setIsValidUser(true);
        } else {
          setIsValidUser(false);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status == 404) {
            setIsValidUser(false);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValidUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}
