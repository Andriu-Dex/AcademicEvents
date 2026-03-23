import { Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import "./styles/FloatingThemeSocketControls.css";

const FloatingThemeSocketControls = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isConnected } = useSocket();

  return (
    <div className="floating-controls">
      <button
        type="button"
        className="floating-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={isDarkMode ? "Modo claro" : "Modo oscuro"}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default FloatingThemeSocketControls;
