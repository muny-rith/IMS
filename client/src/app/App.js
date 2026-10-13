import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import AppRoutes from "./routes";
import "./App.css";

const theme = createTheme({
  typography: {
    fontFamily: "'Battambang', 'Khmer OS Battambang', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
