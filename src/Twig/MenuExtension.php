<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MenuExtension extends AbstractExtension
{
    private string $projectDir;

    public function __construct(string $projectDir)
    {
        $this->projectDir = $projectDir;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('menu_config', [$this, 'getMenuConfig']),
        ];
    }

    public function getMenuConfig(): array
    {
        $defaults = [
            'items' => [
                ['id' => 'accueil', 'label' => 'Accueil', 'url' => '/', 'children' => []],
                ['id' => 'cncdp', 'label' => 'Le CNCDP', 'url' => '#', 'children' => []],
                ['id' => 'code', 'label' => 'Code de déontologie', 'url' => '#', 'children' => []],
                ['id' => 'avis', 'label' => 'Avis & saisines', 'url' => '#', 'children' => []],
                ['id' => 'organisations', 'label' => 'Organisations', 'url' => '#', 'children' => []],
                ['id' => 'contact', 'label' => 'Contact', 'url' => '#', 'children' => []],
            ],
        ];

        $configFile = $this->projectDir . '/config/menu.json';
        if (file_exists($configFile)) {
            $saved = json_decode(file_get_contents($configFile), true);
            if (is_array($saved) && isset($saved['items'])) {
                return $saved;
            }
        }

        return $defaults;
    }
}
