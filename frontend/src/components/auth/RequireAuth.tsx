import React from 'react';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Hackathon mode: Direct access to all console workspaces
  return children;
};

