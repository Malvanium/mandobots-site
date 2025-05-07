import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">Welcome to MandoBots</h1>
    <div className="space-x-4">
      <Link to="/rates" className="text-red-600 underline">View My Rates</Link>
      <Link to="/demos" className="text-red-600 underline">Try Demo Chatbots</Link>
    </div>
  </div>
);

export default Home;
