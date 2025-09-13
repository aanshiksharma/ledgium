import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import Sidebar from "../components/Sidebar";
import Titlebar from "../components/Titlebar";

function Settings() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/auth/login");
      return;
    }

    const fetchData = async () => {
      const res = await fetch(`${apiUrl}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        navigate("/auth/login");
        return;
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Titlebar title="Settings" />
          <p className="flex items-center justify-center h-full text-2xl">
            This page is under development!
          </p>
        </div>
      </div>
    </>
  );
}

export default Settings;
