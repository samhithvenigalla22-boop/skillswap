import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ToastContainer from '../common/Toast';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-darkBg text-textMain dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
