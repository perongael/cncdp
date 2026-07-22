<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteExtension extends AbstractExtension
{
    private string $projectDir;

    public function __construct(string $projectDir)
    {
        $this->projectDir = $projectDir;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('site_config', [$this, 'getSiteConfig']),
        ];
    }

    public function getSiteConfig(): array
    {
        $defaults = [
            'logo' => 'logo_cncdp_transp.png',
        ];

        $configFile = $this->projectDir . '/config/site.json';
        if (file_exists($configFile)) {
            $saved = json_decode(file_get_contents($configFile), true);
            if (is_array($saved)) {
                return array_merge($defaults, $saved);
            }
        }

        return $defaults;
    }
}
