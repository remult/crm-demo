import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompanysList } from './Companies/CompaniesList';

function App() {
  return (
    <div className="App">
      <div className="App">
        <h1>Welcome to React Router!</h1>
        <Routes>
          <Route path="/" element={<AccountManagersList />} />
          <Route path="about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;


function Home() {
  return (
    <>
      <main>
        <h2>Welcome to the homepage!</h2>
        <p>You can do this, I believe in you.</p>
      </main>
      <nav>
        <Link to="/about">About</Link>
      </nav>
    </>
  );
}

function About() {
  return (
    <>
      <main>
        <h2>Who are we?</h2>
        <p>
          That feels like an existential question, don't you
          think?
        </p>
      </main>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </>
  );
}