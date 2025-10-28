import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentView from './components/StudentView';
import TeacherDashboard from './components/TeacherDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<StudentView />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


