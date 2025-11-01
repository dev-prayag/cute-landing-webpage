import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Ongaku from './test'; // your main file (test.jsx)

export default function App() {
  return (
    <Router>
      <Ongaku />
    </Router>
  );
}
