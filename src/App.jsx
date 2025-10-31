import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Ongaku from './test'; // Assuming Ongaku is in ./test.jsx or adjust path

export default function App() {
  return (
    <Router basename="/ongaku">
      <Ongaku />
    </Router>
  );
}
