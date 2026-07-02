import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Request from "./composents/Request";
import Accueil from "./composents/Acceuil";
import Header from "./composents/Header";
import Footer from "./composents/Footer";
import About from "./composents/About";
import Contact from "./composents/Contact"
import Services from "./composents/Services";
import Tarifs from "./composents/Tarifs";

import Login from "./composents/Login";
import HeaderAdmin from "./composents/HeaderAdmin";
import CalendarRdv from "./composents/Calendar";
import CreateAppointment from "./composents/CreateAppointment";
import AdminRoute from "./composents/AdminRoute";
import AdminProfile from "./composents/AdminProfile";


function Layout() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isAdminPage ? <HeaderAdmin /> : <Header />}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/request" element={<Request />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/Services" element={<Services/>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tarifs" element={<Tarifs />} />



          <Route
            path="/admin/calendar"
            element={
              <AdminRoute>
                <CalendarRdv />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/appointment"
            element={
            <AdminRoute>
              <CreateAppointment/>  
            </AdminRoute>}
          />

          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile/>
              </AdminRoute>
            }
          />

        </Routes>
        
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;