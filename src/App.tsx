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

import MandoBotPage from "./components/bots/MandoBot";
import Login from "./pages/Login";

import PrivateRoute from "./components/PrivateRoute";
import InstallPrompt from "./components/InstallPrompt";

import AdminPanel from "./pages/AdminPanel";
import CustomBots from "./pages/CustomBots";

const App: React.FC = () => {
  return (
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

        {/* admin-only panel */}
        <Route
          path="/admin"
          element={<PrivateRoute><AdminPanel /></PrivateRoute>}
        />

        {/* user-accessible custom bots */}
        <Route
          path="/custom-bots"
          element={<PrivateRoute><CustomBots /></PrivateRoute>}
        />

        {/* static pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <InstallPrompt />
    </>
  );
};

export default App;
