import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import Sidebar from "../components/Sidebar";
import Titlebar from "../components/Titlebar";

function Dashboard() {
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
      const res = await fetch(`${apiUrl}/dashboard`, {
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
        {/* 21% of 1512px ~ 320px */}
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Titlebar title={`Welcome, ${user.data.name.split(" ")[0]}!`} />
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
