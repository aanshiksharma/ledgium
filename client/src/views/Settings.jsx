import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

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
      <div className="flex flex-col gap-4 items-center justify-center h-screen bg-neutral-950 text-neutral-300">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
    </>
  );
}

export default Settings;
