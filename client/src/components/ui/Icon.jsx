import {
  LayoutSidebar,
  Search,
  Sun,
  PlusLg,
  Upload,
  ExclamationCircle,
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
      return <Upload size={size} color={color} />;

    default:
      return <ExclamationCircle size={size} color={color} />;
  }
}

export default Icon;
