import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Request from "./composents/Request";
import Accueil from "./composents/Acceuil";
import Header from "./composents/Header";
import Footer from "./composents/Footer";
import About from "./composents/About";
import Contact from "./composents/Contact";
import Services from "./composents/Services";
import Tarifs from "./composents/Tarifs";

import Login from "./composents/Login";
import HeaderAdmin from "./composents/HeaderAdmin";
import CalendarRdv from "./composents/Calendar";
import CreateAppointment from "./composents/CreateAppointment";
import AdminRoute from "./composents/AdminRoute";
import AdminProfile from "./composents/AdminProfile";
import EditAdmin from "./composents/EditAdmin";
import RequestsPage from "./composents/AllRequest";

function Layout() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

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
          {/* Routes Publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/request" element={<Request />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tarifs" element={<Tarifs />} />

          {/* Routes Admin Protégées */}
          <Route
            path="/admin/calendar"
            element={
              <AdminRoute>
                <CalendarRdv />
              </AdminRoute>
            }
          />

          {/* Route de création de RDV */}
          <Route
            path="/admin/appointment"
            element={
              <AdminRoute>
                <CreateAppointment />
              </AdminRoute>
            }
          />

          {/* 👈 NOUVELLE ROUTE : Édition d'un RDV existant */}
          <Route
            path="/admin/appointment/edit/:id"
            element={
              <AdminRoute>
                <CreateAppointment />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/profile/edit"
            element={
              <AdminRoute>
                <EditAdmin />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/request"
            element={
              <AdminRoute>
                <RequestsPage />
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