import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "./ui/Icon";
import Button from "./ui/Button";

function Sidebar() {
  const navLinks = [
    { link: "/dashboard", label: "Overview", icon: "grid" },
    { link: "/transactions", label: "Transactions", icon: "swapHorizontal" },
    { link: "/settings", label: "Settings", icon: "settings" },
    { link: "/support", label: "Help and Support", icon: "info" },
  ];

  const user = useSelector((state) => state.user);

  return (
    <>
      <aside
        className={`flex flex-col justify-between bg-bg-surface
        min-w-[300px] w-[20vw]
        border-r-1 border-border`}
      >
        <div id="top" className="py-6 px-4 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link to={"/"} className="flex gap-4 items-center">
              <p className="w-8 h-8 rounded-lg bg-accent text-text-base flex items-center justify-center text-xl font-bold">
                L
              </p>
              <p className="font-bold text-2xl">Ledgium</p>
            </Link>
            <button
              className={`
                rounded-sm cursor-pointer
                hover:text-text-base
                transition ease-out duration-200
                `}
            >
              <Icon icon="sidebar" size={24} />
            </button>
          </div>

          <hr className="text-border" />

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.link}
                className={({ isActive }) =>
                  `px-4 py-3 flex items-center gap-4 rounded-lg font-medium
                  ${
                    isActive
                      ? "bg-accent text-text-base hover:bg-accent"
                      : "hover:bg-bg-hover"
                  }`
                }
              >
                <Icon icon={link.icon} size={24} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div id="bottom" className="py-6 px-4">
          <Button
            type="button"
            className="hover:bg-bg-hover/50 px-4 py-3"
            onClick={() => {}}
          >
            <div className="flex items-center gap-4 w-full">
              <div className="logo w-10 h-10 bg-accent rounded-full"></div>
              <div className="flex flex-col items-start gap-1">
                <p id="nameOfUser" className="font-bold">
                  {user.data.name}
                </p>
                <p id="username" className="text-xs">
                  {user.data.username}
                </p>
              </div>
            </div>
          </Button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
