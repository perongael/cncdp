<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260716000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cr\u00e9ation de la page d\'accueil par d\u00e9faut';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("INSERT INTO page (title, slug, html_content, grapesjs_data, status, created_at, updated_at) VALUES (
            'Accueil',
            'accueil',
            '<section style=\"padding:80px 0;text-align:center;background:linear-gradient(135deg,#9d38da,#9335e4);color:#fff;\"><div class=\"container\"><h1 style=\"font-size:3rem;font-weight:800;\">Comit\u00e9 National Consultatif<br>de D\u00e9ontologie des Psychologues</h1><p style=\"font-size:1.25rem;opacity:0.9;max-width:700px;margin:1rem auto;\">Instance ind\u00e9pendante charg\u00e9e de veiller au respect du Code de d\u00e9ontologie des psychologues en France. Le CNCDP \u00e9met des avis consultatifs, promeut la r\u00e9flexion \u00e9thique et accompagne les professionnels dans leur pratique.</p><a href=\"#\" class=\"btn btn-light btn-lg\" style=\"margin-top:1rem;\"><i class=\"fa-solid fa-book-open\"></i> Acc\u00e9der au Code de d\u00e9ontologie 2021</a></div></section><section style=\"padding:60px 0;background:#fff;\"><div class=\"container\"><h2 style=\"color:#212529;text-align:center;\">Notre mission</h2><p style=\"color:#495057;text-align:center;max-width:700px;margin:0 auto;\">Le CNCDP est une instance consultative ind\u00e9pendante cr\u00e9\u00e9e par les organisations professionnelles de psychologues.</p></div></section><section style=\"padding:60px 0;background:#feeed4;\"><div class=\"container\"><h2 style=\"text-align:center;color:#212529;margin-bottom:2rem;\">Acc\u00e8s rapides</h2><div class=\"row\"><div class=\"col-md-4\" style=\"margin-bottom:1rem;\"><div class=\"card\" style=\"border:none;box-shadow:0 2px 8px rgba(0,0,0,0.1);height:100%;\"><div class=\"card-body\" style=\"text-align:center;padding:2rem;\"><i class=\"fa fa-file-signature\" style=\"font-size:2.5rem;color:#9d38da;\"></i><h4 style=\"margin-top:1rem;\">Demande d\'avis</h4><p style=\"color:#495057;\">Saisissez le CNCDP pour obtenir un avis sur une question d\u00e9ontologique.</p><a href=\"#\" class=\"btn btn-sm\" style=\"background:#9d38da;color:#fff;\">D\u00e9poser une saisine</a></div></div></div><div class=\"col-md-4\" style=\"margin-bottom:1rem;\"><div class=\"card\" style=\"border:none;box-shadow:0 2px 8px rgba(0,0,0,0.1);height:100%;\"><div class=\"card-body\" style=\"text-align:center;padding:2rem;\"><i class=\"fa fa-magnifying-glass\" style=\"font-size:2.5rem;color:#9d38da;\"></i><h4 style=\"margin-top:1rem;\">Index des avis</h4><p style=\"color:#495057;\">Consultez l\'ensemble des avis rendus par le CNCDP.</p><a href=\"#\" class=\"btn btn-sm\" style=\"background:#9d38da;color:#fff;\">Consulter</a></div></div></div><div class=\"col-md-4\" style=\"margin-bottom:1rem;\"><div class=\"card\" style=\"border:none;box-shadow:0 2px 8px rgba(0,0,0,0.1);height:100%;\"><div class=\"card-body\" style=\"text-align:center;padding:2rem;\"><i class=\"fa fa-handshake\" style=\"font-size:2.5rem;color:#9d38da;\"></i><h4 style=\"margin-top:1rem;\">Organisations</h4><p style=\"color:#495057;\">D\u00e9couvrez les organisations adh\u00e9rentes au CNCDP.</p><a href=\"#\" class=\"btn btn-sm\" style=\"background:#9d38da;color:#fff;\">En savoir plus</a></div></div></div></div></div></section>',
            '{}',
            'published',
            NOW(),
            NOW()
        )");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("DELETE FROM page WHERE slug = 'accueil'");
    }
}
