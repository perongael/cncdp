<?php

namespace App\Command;

use App\Entity\Avis;
use App\Entity\Critere;
use App\Entity\CritereValeur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\String\Slugger\SluggerInterface;

#[AsCommand(
    name: 'app:generate-avis',
    description: 'Génère des avis consultatifs aléatoires pour le développement.',
)]
class GenerateAvisCommand extends Command
{
    private const AVIS_TEMPLATES = [
        [
            'titre' => 'Secret professionnel et travail en équipe pluridisciplinaire',
            'resume' => 'Un psychologue exerçant en institution s\'interroge sur les limites du secret professionnel dans le cadre d\'un travail en équipe pluridisciplinaire. L\'avis rappelle les principes fondamentaux de l\'article 4 du Code de déontologie.',
            'thematiques' => ['secret-professionnel', 'secret-professionnel-partage'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['institution'],
            'articles' => ['art-4-secret-professionnel'],
            'mots_cles' => ['deontologie', 'code-de-deontologie'],
        ],
        [
            'titre' => 'Consentement éclairé et évaluation psychologique',
            'resume' => 'La question porte sur les modalités de recueil du consentement éclairé dans le cadre d\'une évaluation psychologique demandée par un tiers. L\'avis précise les obligations du psychologue en vertu de l\'article 5 du Code.',
            'thematiques' => ['consentement'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['expertise-judiciaire'],
            'articles' => ['art-5-consentement-eclaire'],
            'mots_cles' => ['deontologie', 'expertise'],
        ],
        [
            'titre' => 'Indépendance professionnelle face à une pression hiérarchique',
            'resume' => 'Un psychologue salarié fait face à une demande de sa direction contraire à son éthique professionnelle. L\'avis rappelle le principe d\'indépendance professionnelle garanti par l\'article 6 du Code.',
            'thematiques' => ['independance-professionnelle'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['institution'],
            'articles' => ['art-6-independance-professionnelle'],
            'mots_cles' => ['deontologie', 'psychologue-clinicien'],
        ],
        [
            'titre' => 'Conflit d\'intérêts et expertise judiciaire',
            'resume' => 'Un psychologue commis dans le cadre d\'une expertise civile découvre un lien personnel avec l\'une des parties. L\'avis examine les obligations déontologiques en matière de conflit d\'intérêts.',
            'thematiques' => ['conflit-interets'],
            'type_demandeur' => ['psychologue', 'institution'],
            'contexte' => ['expertise-judiciaire'],
            'articles' => ['art-3-integrite-probite'],
            'mots_cles' => ['deontologie', 'expertise', 'avis-consultatif'],
        ],
        [
            'titre' => 'Déontologie et pratique de la téléconsultation',
            'resume' => 'Avec le développement des téléconsultations, un psychologue s\'interroge sur les garanties déontologiques à mettre en œuvre. L\'avis aborde les questions de confidentialité, de consentement et de qualité des méthodes à distance.',
            'thematiques' => ['deontologie-numerique', 'consentement'],
            'type_demandeur' => ['psychologue', 'organisation'],
            'contexte' => ['exercice-liberal'],
            'articles' => ['art-4-secret-professionnel', 'art-5-consentement-eclaire', 'art-7-qualite-methodes'],
            'mots_cles' => ['deontologie', 'code-de-deontologie', 'avis-consultatif'],
        ],
        [
            'titre' => 'Signalement et protection de l\'enfance',
            'resume' => 'Un psychologue exerçant en libéral reçoit un enfant et s\'interroge sur l\'articulation entre secret professionnel et obligation de signalement. L\'avis détaille les conditions de levée du secret prévues par le Code.',
            'thematiques' => ['secret-professionnel'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['exercice-liberal'],
            'articles' => ['art-1-respect-vie-psychique', 'art-4-secret-professionnel'],
            'mots_cles' => ['deontologie', 'psychologue-clinicien'],
        ],
        [
            'titre' => 'Formation continue et obligation déontologique',
            'resume' => 'La question porte sur l\'étendue de l\'obligation de formation continue prévue à l\'article 10 du Code de déontologie. L\'avis précise les attendus et les bonnes pratiques en la matière.',
            'thematiques' => ['independance-professionnelle'],
            'type_demandeur' => ['organisation'],
            'contexte' => ['formation'],
            'articles' => ['art-2-competence', 'art-10-formation-continue'],
            'mots_cles' => ['deontologie', 'code-de-deontologie'],
        ],
        [
            'titre' => 'Publications scientifiques et respect des personnes',
            'resume' => 'Un chercheur en psychologie s\'interroge sur les règles déontologiques applicables à la publication d\'études de cas. L\'avis rappelle les principes de respect de la vie psychique et d\'anonymisation.',
            'thematiques' => ['consentement', 'deontologie-numerique'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['recherche'],
            'articles' => ['art-1-respect-vie-psychique', 'art-8-information-public'],
            'mots_cles' => ['deontologie', 'code-de-deontologie'],
        ],
        [
            'titre' => 'Relations entre psychologues et devoirs envers les pairs',
            'resume' => 'Un différend oppose deux psychologues autour de la reprise d\'un suivi. L\'avis examine les obligations déontologiques envers les pairs et les bonnes pratiques de transmission.',
            'thematiques' => ['independance-professionnelle'],
            'type_demandeur' => ['psychologue'],
            'contexte' => ['exercice-liberal'],
            'articles' => ['art-9-devoirs-envers-pairs'],
            'mots_cles' => ['deontologie', 'psychologue-clinicien', 'avis-consultatif'],
        ],
        [
            'titre' => 'Utilisation des tests psychologiques : qualité et restitution',
            'resume' => 'La question aborde l\'obligation d\'utiliser des méthodes scientifiquement validées et les modalités de restitution des résultats au patient. L\'avis se fonde sur l\'article 7 du Code.',
            'thematiques' => ['consentement'],
            'type_demandeur' => ['psychologue', 'particulier'],
            'contexte' => ['exercice-liberal', 'institution'],
            'articles' => ['art-2-competence', 'art-5-consentement-eclaire', 'art-7-qualite-methodes'],
            'mots_cles' => ['deontologie', 'code-de-deontologie', 'saisine'],
        ],
    ];

    private const NUMEROS_PREFIX = ['2021', '2022', '2023', '2024', '2025', '2026'];
    private const DATES = [
        '2021-03-15', '2021-06-22', '2021-09-10', '2021-12-05',
        '2022-02-18', '2022-04-30', '2022-07-12', '2022-10-25',
        '2023-01-20', '2023-03-08', '2023-05-17', '2023-08-29', '2023-11-14',
        '2024-02-06', '2024-04-19', '2024-06-28', '2024-09-03', '2024-11-22',
        '2025-01-10', '2025-03-25', '2025-05-30', '2025-08-18', '2025-10-09',
        '2026-01-15', '2026-02-20', '2026-03-28',
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SluggerInterface $slugger,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Forcer la régénération sans confirmation.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Génération d\'avis consultatifs aléatoires');

        // Vérifier que les critères existent
        $critereRepo = $this->em->getRepository(Critere::class);
        if ($critereRepo->count([]) === 0) {
            $io->error('Aucun critère trouvé en base. Exécutez d\'abord la migration.');
            return Command::FAILURE;
        }

        // Vérifier si des avis existent déjà
        $avisRepo = $this->em->getRepository(Avis::class);
        $force = $input->getOption('force');
        if ($avisRepo->count([]) > 0) {
            if (!$force && !$io->confirm('Des avis existent déjà. Voulez-vous les supprimer et régénérer ?', false)) {
                $io->warning('Génération annulée.');
                return Command::SUCCESS;
            }
            // Supprimer tous les avis existants
            foreach ($avisRepo->findAll() as $avis) {
                $this->em->remove($avis);
            }
            $this->em->flush();
            $io->info('Avis existants supprimés.');
        }

        // Récupérer les valeurs de critères par slug
        $critereValeurRepo = $this->em->getRepository(CritereValeur::class);
        $allValeurs = $critereValeurRepo->findAll();
        $valeursBySlug = [];
        foreach ($allValeurs as $v) {
            $valeursBySlug[$v->getSlug()] = $v;
        }

        $count = 0;
        $numeroCounters = [];

        foreach (self::AVIS_TEMPLATES as $i => $template) {
            $annee = substr(self::DATES[$i] ?? '2024', 0, 4);
            if (!isset($numeroCounters[$annee])) {
                $numeroCounters[$annee] = 1;
            }
            $num = $numeroCounters[$annee]++;

            $avis = new Avis();
            $avis->setNumero($annee . '-' . str_pad((string) $num, 2, '0', STR_PAD_LEFT));
            $avis->setTitre($template['titre']);
            $avis->setSlug(strtolower($this->slugger->slug($template['titre'])->toString()));
            $avis->setResume($template['resume']);
            $avis->setContenu($this->generateContenu($template));
            $avis->setDateAvis(new \DateTime(self::DATES[$i] ?? '2024-01-01'));
            $avis->setStatus('published');

            // Ajouter les critères
            $criteresSlugs = array_merge(
                $template['thematiques'] ?? [],
                $template['type_demandeur'] ?? [],
                $template['contexte'] ?? [],
                $template['articles'] ?? [],
                $template['mots_cles'] ?? []
            );

            foreach ($criteresSlugs as $slug) {
                if (isset($valeursBySlug[$slug])) {
                    $avis->addCritere($valeursBySlug[$slug]);
                }
            }

            $this->em->persist($avis);
            $count++;
        }

        $this->em->flush();

        $io->success(sprintf('%d avis consultatifs générés avec succès !', $count));
        $io->table(
            ['Numéro', 'Titre', 'Année', 'Critères'],
            array_map(function ($i, $t) {
                $annee = substr(self::DATES[$i] ?? '2024', 0, 4);
                $num = $annee . '-' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT);
                return [
                    $num,
                    mb_strimwidth($t['titre'], 0, 55, '...'),
                    $annee,
                    count($t['thematiques'] ?? []) + count($t['type_demandeur'] ?? []) + count($t['contexte'] ?? []) + count($t['articles'] ?? []) + count($t['mots_cles'] ?? []),
                ];
            }, array_keys(self::AVIS_TEMPLATES), self::AVIS_TEMPLATES)
        );

        $io->info('Accédez à la page : /avis');
        $io->info('Accédez à l\'admin : /admin/avis');

        return Command::SUCCESS;
    }

    private function generateContenu(array $template): string
    {
        $titre = $template['titre'];
        $resume = $template['resume'];

        $contenu = <<<HTML
<h2>Contexte de la saisine</h2>
<p>Le CNCDP a été saisi par un psychologue exerçant dans le cadre de ses fonctions. La question posée au Comité porte sur les aspects déontologiques de la situation suivante :</p>
<blockquote style="border-left: 4px solid #9d38da; padding-left: 1rem; color: #495057; font-style: italic;">
    <p>{$resume}</p>
</blockquote>

<h2>Analyse déontologique</h2>
<p>Le Comité rappelle les principes fondamentaux énoncés dans le Code de déontologie des psychologues, notamment en ses articles relatifs au respect de la vie psychique, à la compétence professionnelle, à l'intégrité et à la probité.</p>
<p>Après examen approfondi de la situation exposée, le CNCDP considère que les principes déontologiques applicables imposent au psychologue de :</p>
<ul>
    <li><strong>Respecter le cadre déontologique</strong> en toutes circonstances, quelle que soit la pression éventuelle de l'environnement professionnel ;</li>
    <li><strong>Garantir l'information éclairée</strong> de la personne concernée sur les modalités et les finalités de l'intervention ;</li>
    <li><strong>Assurer la confidentialité</strong> des informations recueillies dans le cadre de la relation professionnelle ;</li>
    <li><strong>Maintenir sa compétence</strong> par une formation continue adaptée aux évolutions des connaissances scientifiques.</li>
</ul>

<h2>Avis du Comité</h2>
<p>En application des dispositions du Code de déontologie des psychologues, le CNCDP émet l'avis suivant :</p>
<p>Le psychologue doit, dans la situation décrite, faire prévaloir les principes déontologiques fondamentaux que sont le respect de la vie psychique des personnes, la compétence professionnelle, l'intégrité et l'indépendance. Il lui appartient de rechercher, le cas échéant avec l'aide des organisations professionnelles, les modalités pratiques permettant de concilier ces exigences avec les contraintes de son exercice.</p>
<p>Le présent avis a été adopté par le Comité National Consultatif de Déontologie des Psychologues lors de sa séance plénière.</p>

<h2>Références</h2>
<ul>
    <li>Code de déontologie des psychologues (2021)</li>
    <li>Règlement intérieur du CNCDP</li>
    <li>Avis antérieurs du Comité sur des questions connexes</li>
</ul>
HTML;

        return $contenu;
    }
}
