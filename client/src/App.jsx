import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BrandView from "./pages/BrandView";
import ConversationView from "./pages/ConversationView";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brand/:widgetId" element={<BrandView />} />
          <Route path="/conversation/:conversationId" element={<ConversationView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
