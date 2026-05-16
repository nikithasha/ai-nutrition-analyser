import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MealInput from './pages/MealInput';
import Reports from './pages/Reports';
import GoalSetting from './pages/GoalSetting';
import Profile from './pages/Profile';
import DailyInsights from './pages/DailyInsights';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meal-input" element={<MealInput />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/goal-setting" element={<GoalSetting />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/daily-insights" element={<DailyInsights />} />
      </Routes>
    </Router>
  );
}

export default App;