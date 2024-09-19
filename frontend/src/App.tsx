// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LayoutComponent from './Layout';

const App: React.FC = () => {
  return (
    <Router>
      <LayoutComponent />
    </Router>
  );
};

export default App;
