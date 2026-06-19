import { AuthProvider } from "../features/auth/context/AuthProvider";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
