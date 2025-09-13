import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePageController() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/landing");
    } else {
      navigate("/dashboard");
    }
  }, []);

  return;
}

export default HomePageController;
