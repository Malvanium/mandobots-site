// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Top‑level nav items only. Individual demo bots are linked from /demos
  const links = [
    { to: "/", label: "Home" },
    { to: "/demos", label: "Demos" },
    { to: "/rates", label: "Rates" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const toggle = () => setOpen(!open);

  return (
    <nav className="bg-primary text-offwhite px-6 py-4 flex items-center justify-between shadow-md relative z-20">
      {/* Brand */}
      <h1 className="text-2xl font-display font-bold">MandoBots</h1>

      {/* Desktop links */}
      <ul className="hidden sm:flex space-x-6">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className={`hover:text-neon transition-colors ${
                pathname === l.to ? "underline underline-offset-4" : ""
              }`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden focus:outline-none"
        onClick={toggle}
        aria-label="Toggle menu"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <ul className="sm:hidden absolute top-full left-0 w-full bg-primary text-offwhite flex flex-col py-4 space-y-4 shadow-lg animate-fadeIn">
          {links.map((l) => (
            <li key={l.to} className="text-center">
              <Link
                to={l.to}
                onClick={() => setOpen(false)}
                className="block w-full hover:bg-neon hover:text-primary py-2"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
