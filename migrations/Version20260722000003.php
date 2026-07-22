<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260722000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création des tables avis, critere, critere_valeur et avis_critere';
    }

    public function up(Schema $schema): void
    {
        // Table critere (catégories de filtres dynamiques)
        $this->addSql('CREATE TABLE critere (
            id INT AUTO_INCREMENT NOT NULL,
            nom VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            actif TINYINT(1) NOT NULL DEFAULT 1,
            ordre INT NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            UNIQUE INDEX UNIQ_CRITERE_NOM (nom),
            UNIQUE INDEX UNIQ_CRITERE_SLUG (slug),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // Table critere_valeur (valeurs des filtres)
        $this->addSql('CREATE TABLE critere_valeur (
            id INT AUTO_INCREMENT NOT NULL,
            critere_id INT NOT NULL,
            valeur VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            actif TINYINT(1) NOT NULL DEFAULT 1,
            ordre INT NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX IDX_CV_CRITERE (critere_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_CV_CRITERE FOREIGN KEY (critere_id) REFERENCES critere (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // Table avis
        $this->addSql('CREATE TABLE avis (
            id INT AUTO_INCREMENT NOT NULL,
            numero VARCHAR(50) NOT NULL,
            titre VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            resume LONGTEXT DEFAULT NULL,
            contenu LONGTEXT DEFAULT NULL,
            date_avis DATE NOT NULL,
            annee INT NOT NULL DEFAULT 0,
            pdf_filename VARCHAR(255) DEFAULT NULL,
            status VARCHAR(20) NOT NULL DEFAULT \'draft\',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            UNIQUE INDEX UNIQ_AVIS_NUMERO (numero),
            UNIQUE INDEX UNIQ_AVIS_SLUG (slug),
            INDEX IDX_AVIS_ANNEE (annee),
            INDEX IDX_AVIS_STATUS (status),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // Table de jointure avis <-> critere_valeur (ManyToMany)
        $this->addSql('CREATE TABLE avis_critere (
            avis_id INT NOT NULL,
            critere_valeur_id INT NOT NULL,
            INDEX IDX_AC_AVIS (avis_id),
            INDEX IDX_AC_CV (critere_valeur_id),
            PRIMARY KEY(avis_id, critere_valeur_id),
            CONSTRAINT FK_AC_AVIS FOREIGN KEY (avis_id) REFERENCES avis (id) ON DELETE CASCADE,
            CONSTRAINT FK_AC_CV FOREIGN KEY (critere_valeur_id) REFERENCES critere_valeur (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // Insertion des critères par défaut
        $this->addSql("INSERT INTO critere (nom, slug, actif, ordre, created_at, updated_at) VALUES
            ('Thématique', 'thematique', 1, 10, NOW(), NOW()),
            ('Type de demandeur', 'type-demandeur', 1, 20, NOW(), NOW()),
            ('Contexte', 'contexte', 1, 30, NOW(), NOW()),
            ('Article du Code', 'article-code', 1, 40, NOW(), NOW()),
            ('Mot-clé', 'mot-cle', 1, 50, NOW(), NOW())
        ");

        // Insertion des valeurs par défaut pour chaque critère
        // Thématiques
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Secret professionnel', 'secret-professionnel', 1, 10, NOW(), NOW() FROM critere WHERE slug = 'thematique'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Consentement', 'consentement', 1, 20, NOW(), NOW() FROM critere WHERE slug = 'thematique'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Indépendance professionnelle', 'independance-professionnelle', 1, 30, NOW(), NOW() FROM critere WHERE slug = 'thematique'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Conflit d\'intérêts', 'conflit-interets', 1, 40, NOW(), NOW() FROM critere WHERE slug = 'thematique'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Secret professionnel partagé', 'secret-professionnel-partage', 1, 50, NOW(), NOW() FROM critere WHERE slug = 'thematique'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Déontologie et numérique', 'deontologie-numerique', 1, 60, NOW(), NOW() FROM critere WHERE slug = 'thematique'");

        // Types de demandeur
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Psychologue', 'psychologue', 1, 10, NOW(), NOW() FROM critere WHERE slug = 'type-demandeur'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Organisation', 'organisation', 1, 20, NOW(), NOW() FROM critere WHERE slug = 'type-demandeur'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Institution', 'institution', 1, 30, NOW(), NOW() FROM critere WHERE slug = 'type-demandeur'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Particulier', 'particulier', 1, 40, NOW(), NOW() FROM critere WHERE slug = 'type-demandeur'");

        // Contextes
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Exercice libéral', 'exercice-liberal', 1, 10, NOW(), NOW() FROM critere WHERE slug = 'contexte'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Institution', 'institution', 1, 20, NOW(), NOW() FROM critere WHERE slug = 'contexte'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Expertise judiciaire', 'expertise-judiciaire', 1, 30, NOW(), NOW() FROM critere WHERE slug = 'contexte'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Formation', 'formation', 1, 40, NOW(), NOW() FROM critere WHERE slug = 'contexte'");
        $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
            SELECT id, 'Recherche', 'recherche', 1, 50, NOW(), NOW() FROM critere WHERE slug = 'contexte'");

        // Articles du Code de déontologie
        $articles = [
            [1, 'Respect de la vie psychique', 'article-1'],
            [2, 'Compétence', 'article-2'],
            [3, 'Intégrité et probité', 'article-3'],
            [4, 'Secret professionnel', 'article-4'],
            [5, 'Consentement éclairé', 'article-5'],
            [6, 'Indépendance professionnelle', 'article-6'],
            [7, 'Qualité des méthodes', 'article-7'],
            [8, 'Information du public', 'article-8'],
            [9, 'Devoirs envers les pairs', 'article-9'],
            [10, 'Formation continue', 'article-10'],
        ];
        foreach ($articles as $i => [$num, $titre, $slug]) {
            $ordre = ($i + 1) * 10;
            $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
                SELECT id, 'Art. {$num} — {$titre}', '{$slug}', 1, {$ordre}, NOW(), NOW() FROM critere WHERE slug = 'article-code'");
        }

        // Mots-clés courants
        $motsCles = [
            ['Déontologie', 'deontologie'],
            ['Code de déontologie', 'code-de-deontologie'],
            ['Avis consultatif', 'avis-consultatif'],
            ['Saisine', 'saisine'],
            ['Psychologue clinicien', 'psychologue-clinicien'],
            ['Expertise', 'expertise'],
        ];
        foreach ($motsCles as $i => [$valeur, $slug]) {
            $ordre = ($i + 1) * 10;
            $this->addSql("INSERT INTO critere_valeur (critere_id, valeur, slug, actif, ordre, created_at, updated_at)
                SELECT id, '{$valeur}', '{$slug}', 1, {$ordre}, NOW(), NOW() FROM critere WHERE slug = 'mot-cle'");
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS avis_critere');
        $this->addSql('DROP TABLE IF EXISTS avis');
        $this->addSql('DROP TABLE IF EXISTS critere_valeur');
        $this->addSql('DROP TABLE IF EXISTS critere');
    }
}
