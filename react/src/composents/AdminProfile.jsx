import { useEffect, useState } from "react";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (!admin) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="profile-container">
      <h1>Mon profil</h1>

      <div className="profile-card">
        <p>
          <strong>Nom :</strong> {admin.nom}
        </p>

        <p>
          <strong>Prénom :</strong> {admin.prenom}
        </p>

        <p>
          <strong>Email :</strong> {admin.email}
        </p>

        <p>
          <strong>Telephone :</strong> +33 6 70 52 51 66
        </p>

    

        <div className="profile-actions">
          <button
            onClick={() => {
              window.location.href = "/admin/profile/edit";
            }}
          >
            Modifier les informations
          </button>

          <button
            onClick={() => {
              window.location.href = "/admin/profile/password";
            }}
          >
            Modifier le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}
