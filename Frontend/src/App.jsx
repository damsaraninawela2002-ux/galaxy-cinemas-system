import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <AppRoutes />
      </BookingProvider>
    </ThemeProvider>
  );
}

export default App;
