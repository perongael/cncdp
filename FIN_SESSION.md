🏁 Clôture de session

⚠️ Phase d'analyse et documentation uniquement. Aucune modification de code, refactorisation ou changement fonctionnel autorisé.

Objectif : garder une trace fiable pour qu'une prochaine session reprenne sans perte de contexte.

1. Audit réel de la session

Basé uniquement sur ce qui a été réellement fait (jamais d'invention) :


Fichiers créés / modifiés / supprimés / restructurés : chemin, rôle, ce qui a changé, impact
Décisions techniques : quoi, pourquoi, alternative envisagée, impact futur (archi, Doctrine, dépendances, conventions...)
Problèmes : résolus (+ solution), non résolus (+ impact + piste), compromis acceptés (+ dette technique créée)
Tests : commandes exécutées, résultat (OK / Échec / À vérifier)


2. Mise à jour de RELAIS_CONTEXTE.md

Ne jamais supprimer l'historique ou les décisions existantes. Ajouter :


En-tête session : tag (ex: [AUTH][API][DATABASE][ADMIN][FRONT][UX][FIX][REFACTOR][SECURITY][PERFORMANCE][DEPLOY]), date, objectif, résumé
Inventaire à jour ([NEW]/[MODIF]/[DEL]/[RESTRUCTURE] : fichier, rôle, modif, état)
Architecture : uniquement si nouveaux composants/dépendances/flux/règles
État : ✅ Terminé / 🚧 En cours / ⚠️ Attention / 🔍 À vérifier
Décisions importantes à respecter dans le futur (décision, date, raison)
Next Step : UNE action précise, technique, réalisable en une session.
❌ Interdit : "continuer/avancer/améliorer le projet" (trop vague)
✅ Exemple : "Ajouter la validation Symfony Validator sur le formulaire d'inscription"


3. Documentation technique des fonctionnalités

Pour chaque fonctionnalité créée/modifiée cette session, vérifier qu'elle est documentée dans /docs/features/FEATURE_NOM.md (créer si absent) avec : Objectif, Fonctionnement métier, Fonctionnement technique, Fichiers concernés (chemin + rôle), Base de données (si concerné), Sécurité (rôles/permissions), Points importants, Évolutions possibles, Historique (créé/modifié le JJ/MM/AAAA — session [TAG]).

Si un doc général existant est modifié, ajouter une ligne "Mis à jour le JJ/MM/AAAA — Session [TAG]" sans effacer l'historique.

4. Rapport final (format obligatoire)

# ✅ Réalisé
- ...

# 📁 Fichiers touchés
Créés / Modifiés / Supprimés : ...

# 🧠 Décisions importantes
- ...

# 🐛 Problèmes / Points d'attention
- ...

# 📚 Documentation créée ou mise à jour
- ...

# 📍 Next Step
[copier exactement la section Next Step de RELAIS_CONTEXTE.md]

Terminer exactement par : "Session sauvegardée. RELAIS_CONTEXTE.md est à jour."