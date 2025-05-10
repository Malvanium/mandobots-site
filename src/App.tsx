// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Rates from "./pages/Rates";
import Demos from "./pages/Demos";
import About from "./pages/About";
import Contact from "./pages/Contact";

import FaqBot from "./components/bots/FaqBot";
import AppointmentBot from "./components/bots/AppointmentBot";
import RealEstateBot from "./components/bots/RealEstateBot";
import SegmentationBot from "./components/bots/SegmentationBot"; // ✅ New bot

import MandoBotPage from "./pages/MandoBot"; // ✅ New standalone page

const App: React.FC = () => (
  <>
    <NavBar />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rates" element={<Rates />} />

      {/* demo hub */}
      <Route path="/demos" element={<Demos />} />
      <Route path="/demos/faq" element={<FaqBot />} />
      <Route path="/demos/appointment" element={<AppointmentBot />} />
      <Route path="/demos/real-estate" element={<RealEstateBot />} />
      <Route path="/demos/segment" element={<SegmentationBot />} /> {/* ✅ New route */}

      {/* official FAQ bot */}
      <Route path="/mandobot" element={<MandoBotPage />} /> {/* ✅ New route */}

      {/* static pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </>
);

export default App;
