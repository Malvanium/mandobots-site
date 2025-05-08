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

const App: React.FC = () => {
  return (
    <>
      <NavBar />

      <Routes>
        {/* Main landing page */}
        <Route path="/" element={<Home />} />

        {/* Service rates page */}
        <Route path="/rates" element={<Rates />} />

        {/* Demo selector */}
        <Route path="/demos" element={<Demos />} />

        {/* Deep links into individual bots */}
        <Route path="/demos/faq" element={<FaqBot />} />
        <Route path="/demos/appointment" element={<AppointmentBot />} />

        {/* Static content pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
};

export default App;
