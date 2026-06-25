
class Request {
  constructor(data) {
    this.num_rdv = data.num_rdv;
    this.type_client = data.type_client;
    this.nom = data.nom;
    this.prenom = data.prenom || null;
    this.email = data.email;
    this.phone = data.phone;
    this.adresse = data.adresse;
    this.ville = data.ville;
    this.code_postal = data.code_postal;
    this.complement_adresse = data.complement_adresse || null;
    this.piece_jointe = data.piece_jointe || null;
  }
}

module.exports = Request;