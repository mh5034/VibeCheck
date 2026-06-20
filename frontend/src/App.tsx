import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Topic from "./pages/Topic";
import Auth from "./pages/Auth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:id" element={<Topic />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
