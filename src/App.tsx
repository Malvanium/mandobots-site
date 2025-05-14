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
import SegmentationBot from "./components/bots/SegmentationBot";

import MandoBotPage from "./components/bots/MandoBot"; // ✅ Standalone page for your site's FAQ
import Login from "./pages/Login"; // ✅ Login page

import PrivateRoute from "./components/PrivateRoute"; // ✅ Protect sensitive bot routes
import InstallPrompt from "./components/InstallPrompt"; // ✅ NEW: PWA install prompt

const App: React.FC = () => (
  <>
    <NavBar />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rates" element={<Rates />} />

      {/* demo hub */}
      <Route path="/demos" element={<Demos />} />
      <Route
        path="/demos/faq"
        element={<PrivateRoute><FaqBot /></PrivateRoute>}
      />
      <Route
        path="/demos/appointment"
        element={<PrivateRoute><AppointmentBot /></PrivateRoute>}
      />
      <Route
        path="/demos/real-estate"
        element={<PrivateRoute><RealEstateBot /></PrivateRoute>}
      />
      <Route
        path="/demos/segment"
        element={<PrivateRoute><SegmentationBot /></PrivateRoute>}
      />

      {/* official FAQ bot */}
      <Route path="/mandobot" element={<MandoBotPage />} />

      {/* auth */}
      <Route path="/login" element={<Login />} />

      {/* static pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>

    <InstallPrompt /> {/* ✅ Add PWA install prompt */}
  </>
);

export default App;
