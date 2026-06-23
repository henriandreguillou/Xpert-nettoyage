import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Request from "./composents/Request";
import Accueil from "./composents/Acceuil";
import MyRequest from "./composents/MyRequest";
import ModifierRendezvous from "./composents/ModifierRendezvous";
import Header from "./composents/Header";
import HeaderAdmin from "./composents/HeaderAdmin";
import Footer from "./composents/Footer";
import CalendarRdv from "./composents/Calendar";
import AdminRoute from "./composents/AdminRoute";
import Login from "./composents/Login";
import AdminProfile from "./composents/AdminProfile";
import About from "./composents/About";
import Contact from "./composents/Contact"
import Services from "./composents/Services";


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
          <Route path="/myrequest" element={<MyRequest />} />
          <Route path="/modifier/:num_rdv" element={<ModifierRendezvous />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/Services" element={<Services/>} />
          <Route path="/contact" element={<Contact />} />


          <Route
            path="/admin/calendar"
            element={
              <AdminRoute>
                <CalendarRdv />
              </AdminRoute>
            }
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