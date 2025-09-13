import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePageController() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/landing");
    }
  }, []);

  return;
}

export default HomePageController;
