import React from 'react';
import ChatSelector from '../components/ChatSelector';

const Demos: React.FC = () => (
  <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
    <h2 className="text-3xl font-bold text-primary mb-4">Demo Bots</h2>
    <ChatSelector />
  </div>
);

export default Demos;
