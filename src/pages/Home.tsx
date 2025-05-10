import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center space-y-10">

      {/* MandoBot logo + friendly message */}
      <div className="max-w-xl">
        <img
          src="/mandobot.png"
          alt="MandoBot logo"
          className="w-32 h-32 mx-auto mb-4 animate-fadeIn"
        />
        <h2 className="text-3xl font-display font-bold text-primary mb-2">
          Meet MandoBot
        </h2>
        <p className="text-lg text-black mb-4 font-display">
          MandoBot is here to show you what’s possible. Want to see how custom
          bots can work on your own site? Try the demos or explore pricing—
          and if you're curious, feel free to reach out!
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/demos"
            className="bg-primary text-offwhite px-5 py-2 rounded shadow hover:bg-neon transition"
          >
            Try Demo Bots
          </Link>
          <Link
            to="/contact"
            className="bg-white text-primary font-semibold px-5 py-2 rounded shadow hover:bg-gray-200 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* ORIGINAL CONTENT */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome to MandoBots</h1>
        <div className="space-x-4">
          <Link to="/rates" className="text-red-600 underline">
            View My Rates
          </Link>
          <Link to="/demos" className="text-red-600 underline">
            Try Demo Chatbots
          </Link>
        </div>
      </div>
    </div>
  );
}
