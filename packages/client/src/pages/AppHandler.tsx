import { useState, useContext } from 'react';
import AppNavbar from '../components/AppNavbar';
import { context } from './Context';
import LoginPage from './LoginPage';

export default function AppHandler() {
  const ctx = useContext(context);
  return <>{ctx !== '' && ctx !== undefined ? <AppNavbar /> : <LoginPage />}</>;
}
