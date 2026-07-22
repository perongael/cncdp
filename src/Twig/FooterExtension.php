<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FooterExtension extends AbstractExtension
{
    private string $projectDir;

    public function __construct(string $projectDir)
    {
        $this->projectDir = $projectDir;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('footer_config', [$this, 'getFooterConfig']),
        ];
    }

    public function getFooterConfig(): array
    {
        $defaults = [
            'address' => "Comité National Consultatif\nde Déontologie des Psychologues\n\n71, avenue Edouard Vaillant\n92100 Boulogne-Billancourt\nFrance",
            'email' => 'contact@cncdp.fr',
            'links' => "Code de déontologie 2021 | /code-de-deontologie\nIndex des avis | /avis\nAdhésion des organisations | /adhesion\nDemande d'avis consultatif | /saisine",
            'bottom_text' => '© ' . date('Y') . ' CNCDP — Tous droits réservés',
            'contact_links' => "Formulaire de saisine en ligne | /saisine\nNous écrire | /contact",
            'bottom_links' => "Mentions légales | /mentions-legales\nPolitique de confidentialité | /confidentialite",
        ];

        $configFile = $this->projectDir . '/config/footer.json';
        if (file_exists($configFile)) {
            $saved = json_decode(file_get_contents($configFile), true);
            if (is_array($saved)) {
                return array_merge($defaults, $saved);
            }
        }

        return $defaults;
    }
}
