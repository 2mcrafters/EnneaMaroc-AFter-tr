Demande d'inscription (formulaire confirmation)

SYNTHESE
- User ID: {{ $p['user_id'] ?? '' }}
- Course/Parcours ID: {{ $p['course_id'] ?? '' }}
- Groupe ID: {{ $p['group_id'] ?? '' }}
@if(!empty($p['course_title']))- Cours: {{ $p['course_title'] }}
@endif
@if(!empty($p['group_title']))- Option: {{ $p['group_title'] }}
@endif
@if(!empty($p['monthly_amount']))- Montant mensuel: {{ $p['monthly_amount'] }} MAD
@endif
@if(!empty($p['duration_months']))- Durée: {{ $p['duration_months'] }} mois
@endif

INFORMATIONS PERSONNELLES
- Nom: {{ $p['nom'] ?? '' }}
- Prénom: {{ $p['prenom'] ?? '' }}
- Adresse: {{ $p['adresse'] ?? '' }}
- Téléphone personnel: {{ $p['telephone_personnel'] ?? '' }}
- Email: {{ $p['email'] ?? '' }}
- Diplôme obtenu: {{ $p['diplome_obtenu'] ?? '' }}
- Profession exercée: {{ $p['profession_exercee'] ?? '' }}

@if(!empty($p['entreprise']) || !empty($p['is_entreprise']))
INFORMATIONS ENTREPRISE
- Entreprise: {{ $p['entreprise'] ?? '' }}
- Bon de commande: {{ $p['bon_de_commande'] ?? '' }}
- Adresse facturation: {{ $p['adresse_facturation'] ?? '' }}
- Contact dossier: {{ $p['contact_dossier'] ?? '' }}
- Téléphone contact: {{ $p['telephone_contact'] ?? '' }}
- Email contact: {{ $p['email_contact'] ?? '' }}
@endif

Conditions acceptées: {{ !empty($p['accept_conditions']) ? 'Oui' : 'Non' }}
