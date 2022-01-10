import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompaniesList } from './Companies/CompaniesList';
import { ContactsList } from './Contacts/ConactList';
import { CompanyShow } from './Companies/CompanyShow';


function App() {
  return (
    <div className="App">
      <div className="App">
        <h1>Welcome to React Router!</h1>
        <Routes>
          <Route path="/" element={<ContactsList />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/companies/:id" element={<CompanyShow />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
