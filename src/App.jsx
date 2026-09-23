import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { LiveMonitor } from "./pages/LiveMonitor";
import { Analytics } from "./pages/Analytics";
import { Map } from "./pages/Map";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitor" element={<LiveMonitor />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/map" element={<Map />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
