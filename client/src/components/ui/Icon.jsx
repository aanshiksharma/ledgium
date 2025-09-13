import {
  LayoutSidebar,
  Search,
  Sun,
  PlusLg,
  ExclamationCircle,
  ThreeDots,
} from "react-bootstrap-icons";

import {
  SwapHoriz,
  GridViewOutlined,
  InfoOutline,
  Settings,
} from "@mui/icons-material";

function Icon({ icon, size, color }) {
  switch (icon) {
    case "sidebar":
      return <LayoutSidebar size={size} color={color} />;

    case "grid":
      return <GridViewOutlined style={{ fontSize: size }} color={color} />;

    case "swapHorizontal":
      return <SwapHoriz style={{ fontSize: size }} color={color} />;

    case "settings":
      return <Settings size={size} color={color} />;

    case "info":
      return <InfoOutline style={{ fontSize: size }} color={color} />;

    case "plus":
      return <PlusLg size={size} color={color} />;

    case "search":
      return <Search size={size} color={color} />;

    case "sun":
      return <Sun size={size} color={color} />;

    case "upload":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={`${size}px`}
          viewBox="0 -960 960 960"
          width={`${size}px`}
          fill="currentColor"
        >
          <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
        </svg>
      );

    case "threeDots":
      return <ThreeDots size={size} color={color} />;

    default:
      return <ExclamationCircle size={size} color={color} />;
  }
}

export default Icon;
