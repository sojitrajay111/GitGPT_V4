import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Loader2 className="animate-spin h-10 w-10 text-purple-500" />
      <p className="ml-3 text-lg text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingScreen;
