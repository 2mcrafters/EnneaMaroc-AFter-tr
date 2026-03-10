<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Demande d'inscription</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color:#0f172a;">
    <h2 style="margin:0 0 12px 0;">Demande d'inscription (formulaire confirmation)</h2>

    <h3 style="margin:18px 0 8px 0;">Synthèse</h3>
    <ul>
        <li><strong>User ID:</strong> {{ $p['user_id'] ?? '' }}</li>
        <li><strong>Course/Parcours ID:</strong> {{ $p['course_id'] ?? '' }}</li>
        <li><strong>Groupe ID:</strong> {{ $p['group_id'] ?? '' }}</li>
        @if(!empty($p['course_title']))
            <li><strong>Cours:</strong> {{ $p['course_title'] }}</li>
        @endif
        @if(!empty($p['group_title']))
            <li><strong>Option:</strong> {{ $p['group_title'] }}</li>
        @endif
        @if(!empty($p['monthly_amount']))
            <li><strong>Montant mensuel:</strong> {{ $p['monthly_amount'] }} MAD</li>
        @endif
        @if(!empty($p['duration_months']))
            <li><strong>Durée:</strong> {{ $p['duration_months'] }} mois</li>
        @endif
    </ul>

    <h3 style="margin:18px 0 8px 0;">Informations personnelles</h3>
    <ul>
        <li><strong>Nom:</strong> {{ $p['nom'] ?? '' }}</li>
        <li><strong>Prénom:</strong> {{ $p['prenom'] ?? '' }}</li>
        <li><strong>Adresse:</strong> {{ $p['adresse'] ?? '' }}</li>
        <li><strong>Téléphone personnel:</strong> {{ $p['telephone_personnel'] ?? '' }}</li>
        <li><strong>Email:</strong> {{ $p['email'] ?? '' }}</li>
        <li><strong>Diplôme obtenu:</strong> {{ $p['diplome_obtenu'] ?? '' }}</li>
        <li><strong>Profession exercée:</strong> {{ $p['profession_exercee'] ?? '' }}</li>
    </ul>

    @if(!empty($p['entreprise']) || !empty($p['is_entreprise']))
        <h3 style="margin:18px 0 8px 0;">Informations entreprise</h3>
        <ul>
            <li><strong>Entreprise:</strong> {{ $p['entreprise'] ?? '' }}</li>
            <li><strong>Bon de commande:</strong> {{ $p['bon_de_commande'] ?? '' }}</li>
            <li><strong>Adresse facturation:</strong> {{ $p['adresse_facturation'] ?? '' }}</li>
            <li><strong>Contact dossier:</strong> {{ $p['contact_dossier'] ?? '' }}</li>
            <li><strong>Téléphone contact:</strong> {{ $p['telephone_contact'] ?? '' }}</li>
            <li><strong>Email contact:</strong> {{ $p['email_contact'] ?? '' }}</li>
        </ul>
    @endif

    <p style="margin-top:18px; font-size:12px; color:#64748b;">
        Conditions acceptées: {{ !empty($p['accept_conditions']) ? 'Oui' : 'Non' }}
    </p>
</body>
</html>
