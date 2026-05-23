import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-primary mb-4">{title || 'Coming Soon'}</h1>
        <p className="text-gray-600 mb-6">This feature is under development. We'll be ready soon!</p>
        <Link to="/" className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-opacity-90">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;