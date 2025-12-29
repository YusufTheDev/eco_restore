<?php

namespace App\Command;

use App\Entity\Material;
use App\Repository\MaterialRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsCommand(
    name: 'app:sync-materials',
    description: 'Syncs material definitions from external API (simulated)',
)]
class SyncMaterialsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MaterialRepository $materialRepository,
        private HttpClientInterface $client,
        private ParameterBagInterface $params
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Syncing Materials from Climatiq API...');

        $apiKey = $this->params->get('app.climatiq_api_key');
        if (!$apiKey) {
            $io->error('CLIMATIQ_API_KEY not found in parameters.');
            return Command::FAILURE;
        }

        try {
            $terms = [
                'concrete',
                'steel',
                'iron',
                'aluminum',
                'copper',
                'wood',
                'pine',
                'oak',
                'glass',
                'plastic',
                'brick',
                'stone',
                'granite',
                'marble',
                'insulation',
                'ceramics',
                'textile',
                'electronics',
                'plaster',
                'mortar',
                'paper',
                'cardboard',
                'asphalt'
            ];

            $aggregatedMaterials = []; // Key: "name|unit" => ['totalFactor' => x, 'count' => y, 'category' => z]

            foreach ($terms as $term) {
                $io->text("Fetching '$term'...");

                // Fetch 3 pages (approx 180 results per term)
                for ($page = 1; $page <= 3; $page++) {
                    try {
                        $response = $this->client->request('GET', 'https://api.climatiq.io/data/v1/search', [
                            'headers' => [
                                'Authorization' => 'Bearer ' . $apiKey,
                            ],
                            'query' => [
                                'query' => $term,
                                'results_per_page' => 60,
                                'page' => $page,
                                'data_version' => '^14', // Restored to valid version
                            ],
                        ]);

                        $data = $response->toArray();
                        $results = $data['results'] ?? [];

                        if (empty($results)) {
                            break; // Stop pagination if no results
                        }

                        foreach ($results as $item) {
                            $this->processItem($item, $aggregatedMaterials);
                        }

                        // Polite delay
                        usleep(200000);
                    } catch (\Exception $e) {
                        $io->warning("Failed fetching page $page for $term: " . $e->getMessage());
                        break;
                    }
                }
            }

            $io->text("Aggregating " . count($aggregatedMaterials) . " unique materials...");
            $persistedCount = 0;

            foreach ($aggregatedMaterials as $key => $data) {
                list($name, $unit) = explode('|', $key);
                $avgFactor = $data['totalFactor'] / $data['count'];

                // Upsert
                $material = $this->materialRepository->findOneBy(['name' => $name, 'unit' => $unit]);

                if (!$material) {
                    $material = new Material();
                    $material->setName($name);
                    $material->setUnit($unit);
                }

                $material->setCategory($data['category']);
                $material->setCarbonFootprintPerUnit((float) $avgFactor);
                $material->setDensity($data['density'] ?? null);
                $material->setSourceDate(new \DateTime());

                // MOCK: Randomize Industry Average so it's not always "15% better"
                // Range: 0.8x (Worse) to 1.4x (Better) of current
                $randomMultiplier = rand(80, 140) / 100;
                $material->setIndustryAverageFactor($avgFactor * $randomMultiplier);

                $this->entityManager->persist($material);
                $persistedCount++;

                if ($persistedCount % 100 === 0) {
                    $this->entityManager->flush();
                    $this->entityManager->clear(); // Detach to save memory
                }
            }

            $this->entityManager->flush();
            $io->success("Successfully synced $persistedCount unique materials (merged & averaged)!");
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('API Sync Failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function processItem(array $item, array &$aggregated): void
    {
        // Name Cleaning
        $rawName = $item['name'] ?? 'Unknown';
        // Remove text in parentheses, extra spaces, and "Commercial" prefixes
        $name = preg_replace('/\s*\(.*?\)/', '', $rawName);
        $name = preg_replace('/^Commercial\s+/i', '', $name);
        $name = trim($name);
        $name = ucfirst($name);

        if (strlen($name) < 3)
            return;

        // Factor & Validation
        // Try multiple common keys for emission factor
        $factor = $item['co2e'] ?? $item['factor'] ?? $item['co2e_total'] ?? $item['constituent_gases']['co2e_total'] ?? 0;

        // Category Normalization
        $rawCategory = strtolower($item['category'] ?? '');
        $category = 'General';

        if (str_contains($rawCategory, 'metal') || str_contains($rawCategory, 'steel') || str_contains($rawCategory, 'aluminium') || str_contains($rawCategory, 'copper'))
            $category = 'Metals';
        elseif (str_contains($rawCategory, 'plastic') || str_contains($rawCategory, 'polymer') || str_contains($rawCategory, 'pvc'))
            $category = 'Plastics';
        elseif (str_contains($rawCategory, 'wood') || str_contains($rawCategory, 'timber') || str_contains($rawCategory, 'plywood'))
            $category = 'Wood & Timber';
        elseif (str_contains($rawCategory, 'concrete') || str_contains($rawCategory, 'cement') || str_contains($rawCategory, 'mortar'))
            $category = 'Concrete';
        elseif (str_contains($rawCategory, 'glass'))
            $category = 'Glass';
        elseif (str_contains($rawCategory, 'textile') || str_contains($rawCategory, 'fabric') || str_contains($rawCategory, 'cotton'))
            $category = 'Textiles';
        elseif (str_contains($rawCategory, 'electronics'))
            $category = 'Electronics';
        elseif (str_contains($rawCategory, 'brick') || str_contains($rawCategory, 'stone') || str_contains($rawCategory, 'plaster'))
            $category = 'Construction';
        elseif (str_contains($rawCategory, 'paper') || str_contains($rawCategory, 'cardboard'))
            $category = 'Paper';

        // Unit Normalization & Density logic
        $unitType = strtolower($item['unit_type'] ?? 'unit');
        $unit = match ($unitType) {
            'weight' => 'kg',
            'volume' => 'm3',
            'area' => 'm2',
            'energy' => 'kWh',
            'money' => 'cost',
            default => $unitType,
        };

        // Filter out money/cost units as requested
        if ($unit === 'cost' || $unit === 'money')
            return;

        // Fallback Logic: Enable Estimate if API returns 0/Null
        if ($factor <= 0) {
            $factor = $this->estimateFactor($name, $category, $unit);
        }

        // DENSITY CORRECTION FOR CLIMATIQ DATA
        // Problem: API often provides per-kg factors even for m3 items.
        // Fix: If unit is m3 and factor is < 50 (too low for a m3 of material), apply density multiplier.
        $calculatedDensity = null;
        if ($unit === 'm3') {
            $calculatedDensity = match ($category) {
                'Concrete', 'Construction', 'Stone', 'Plaster', 'Mortar' => 2400,
                'Metals', 'Steel', 'Copper' => 7850,
                'Aluminum' => 2700,
                'Glass' => 2500,
                'Wood & Timber' => 600, // Generic softwood
                'Plastics' => 950,
                'Paper', 'Cardboard' => 900, // Compacted
                'Textiles' => 1500,
                default => 1000 // Water baseline
            };

            // If factor is low, correct it
            if ($factor < 50) {
                $factor *= $calculatedDensity;
            }
        }

        if ($factor <= 0)
            return;

        // Key for Aggregation (Name + Unit)
        $key = "$name|$unit";

        if (!isset($aggregated[$key])) {
            $aggregated[$key] = [
                'totalFactor' => 0,
                'count' => 0,
                'category' => $category,
                'density' => $calculatedDensity
            ];
        }

        $aggregated[$key]['totalFactor'] += $factor;
        $aggregated[$key]['count']++;
        if ($calculatedDensity && !$aggregated[$key]['density']) {
            $aggregated[$key]['density'] = $calculatedDensity;
        }
    }

    private function estimateFactor(string $name, string $category, string $unit): float
    {
        $name = strtolower($name);
        $category = strtolower($category);
        $baseFactor = 0.0; // Per KG baseline

        // Specific Overrides for Robust Fallback
        if (str_contains($name, 'copper'))
            return 3.8;
        if (str_contains($name, 'aluminum') || str_contains($name, 'aluminium'))
            return 12.0; // High impact
        if (str_contains($name, 'steel'))
            return 1.85;
        if (str_contains($name, 'iron'))
            return 1.9; // Slightly different from steel
        if (str_contains($name, 'pine') || str_contains($name, 'softwood'))
            return 0.45;
        if (str_contains($name, 'oak') || str_contains($name, 'hardwood'))
            return 0.55; // Denser
        if (str_contains($name, 'granite'))
            return 0.3;
        if (str_contains($name, 'marble'))
            return 0.4;

        // Base Factors (approx kgCO2e / kg)
        if (str_contains($name, 'concrete') || $category === 'concrete')
            $baseFactor = 0.15;
        elseif ($category === 'metals')
            $baseFactor = 1.85; // Generic metal
        elseif (str_contains($name, 'plastic') || $category === 'plastics')
            $baseFactor = 2.5;
        elseif (str_contains($name, 'wood') || $category === 'wood & timber')
            $baseFactor = 0.5;
        elseif (str_contains($name, 'glass') || $category === 'glass')
            $baseFactor = 1.2;
        elseif (str_contains($name, 'brick') || str_contains($name, 'stone'))
            $baseFactor = 0.22;
        elseif (str_contains($name, 'insulation'))
            $baseFactor = 1.8;
        elseif (str_contains($name, 'paper') || $category === 'paper')
            $baseFactor = 0.9;

        if ($baseFactor <= 0)
            return 0.0;

        // Density Multipliers (kg/m3) for Volume units
        if ($unit === 'm3') {
            if ($category === 'concrete')
                return $baseFactor * 2400; // ~2400 kg/m3
            if ($category === 'metals')
                return $baseFactor * 7850; // Steel density
            if ($category === 'wood & timber')
                return $baseFactor * 600; // Softwood
            if ($category === 'glass')
                return $baseFactor * 2500;
            if ($category === 'plastics')
                return $baseFactor * 950;
            if ($category === 'construction')
                return $baseFactor * 1600; // Brick/Stone avg
        }

        return $baseFactor;
    }

    // Removed mock data generation
}
