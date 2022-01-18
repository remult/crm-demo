import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompaniesList } from './Companies/CompaniesList';
import { ContactsList } from './Contacts/ConactList';
import { CompanyShow } from './Companies/CompanyShow';
import { CssBaseline } from '@mui/material';


function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <div className="App">
        <div style={{ textAlign: "center" }}>
          <h1>Welcome to React Router!</h1>
        </div>
        <Routes>
          <Route path="/" element={<AccountManagersList />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/companies/:id" element={<CompanyShow />} />

        </Routes>
      </div >
    </React.Fragment>
  );
}

export default App;
