import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react"; // hamburger icon

const NavBar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-red-600 text-white">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold">MandoBots</Link>
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className={`${open ? "block" : "hidden"} md:flex space-x-6`}>
          {["/", "/rates", "/demos", "/about", "/contact"].map((path, i) => (
            <Link
              key={i}
              to={path}
              className="hover:underline"
              onClick={() => setOpen(false)}
            >
              {["Home","Rates","Demos","About","Contact"][i]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
