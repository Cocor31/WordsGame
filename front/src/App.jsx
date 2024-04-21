import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { useState } from 'react';
import Profil from './pages/Profil';
import tokenService from './services/TokenService';


function App() {
  const [socket, setSocket] = useState(undefined);
  const PrivateRoute = () => {
    return tokenService.isAuthentified() === true ? (
      <Outlet />
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" />} /> */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home setSocket={setSocket} />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/chat" element={<ChatPage socket={socket} />} />
          </Route>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;