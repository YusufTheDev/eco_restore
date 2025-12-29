<?php

namespace App\Controller;

use App\Entity\Claim;
use App\Entity\ClaimItem;
use App\Entity\Material;
use App\Repository\ClaimRepository;
use App\Repository\MaterialRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ApiController extends AbstractController
{
    #[Route('/api/material-lookup', name: 'api_material_lookup', methods: ['GET'])]
    public function getMaterials(Request $request, MaterialRepository $repo): JsonResponse
    {
        $q = $request->query->get('q', '');

        $queryBuilder = $repo->createQueryBuilder('m')
            ->orderBy('m.name', 'ASC')
            ->setMaxResults(5);

        if ($q) {
            $queryBuilder->andWhere('m.name LIKE :search')
                ->setParameter('search', '%' . $q . '%');
        }

        $materials = $queryBuilder->getQuery()->getResult();
        $data = [];

        foreach ($materials as $m) {
            $data[] = [
                'id' => $m->getId(),
                'name' => $m->getName(),
                'category' => $m->getCategory(),
                'unit' => $m->getUnit() ?? 'unit',
                'factor' => $m->getCarbonFootprintPerUnit(),
                'density' => $m->getDensity(),
                'source_date' => $m->getSourceDate()?->format('Y-m-d'),
                'industry_average' => $m->getIndustryAverageFactor(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/recommend/{id}', name: 'api_recommend', methods: ['GET'])]
    public function getRecommendation(int $id, MaterialRepository $repo): JsonResponse
    {
        try {
            $material = $repo->find($id);
            if (!$material)
                return $this->json(null);

            $better = $repo->findBetterAlternative(
                $material->getCategory(),
                $material->getCarbonFootprintPerUnit(),
                $material->getUnit() ?? 'unit' // Guard against null unit
            );

            if (!$better)
                return $this->json(null);

            // Calculate potential savings (%)
            $currentFactor = $material->getCarbonFootprintPerUnit();
            if ($currentFactor <= 0)
                return $this->json(null);

            $saving = $currentFactor - $better->getCarbonFootprintPerUnit();
            $percent = round(($saving / $currentFactor) * 100);

            return $this->json([
                'id' => $better->getId(),
                'name' => $better->getName(),
                'factor' => $better->getCarbonFootprintPerUnit(),
                'percent_saving' => $percent
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/carbon-stats', name: 'api_carbon_stats', methods: ['GET', 'POST'])]
    public function handleStats(
        Request $request,
        EntityManagerInterface $entityManager,
        ClaimRepository $claimRepo,
        MaterialRepository $materialRepo
    ): JsonResponse {
        // 1. Handle POST: Save new Claim with LinkItems
        if ($request->isMethod('POST')) {
            $data = $request->toArray();

            $claim = new Claim();
            $claim->setClaimNumber('CLM-' . uniqid());
            $claim->setPolicyHolder('Dashboard User'); // Hardcoded for now

            $totalScore = 0.0;

            foreach ($data['items'] as $item) {
                $material = $materialRepo->find($item['materialId']);
                if (!$material)
                    continue;

                $qty = (float) $item['quantity'];

                $claimItem = new ClaimItem();
                $claimItem->setMaterial($material);
                $claimItem->setQuantityUsed($qty);

                // Transport (RICS Logic)
                $dist = (float) ($item['transportDistance'] ?? 0);
                $method = $item['transportMethod'] ?? 'truck';

                $claimItem->setTransportDistance($dist);
                $claimItem->setTransportMethod($method);

                // Link both ways
                $claim->addClaimItem($claimItem);

                // 1. Material Impact
                $materialImpact = $qty * $material->getCarbonFootprintPerUnit();

                // 2. Transport Impact
                // Weight (tonnes) = (Qty * Density) / 1000. Default density 0 if missing.
                $density = $material->getDensity() ?? 0;
                $weightTonnes = ($qty * $density) / 1000;

                // Factors (tkm)
                $transportFactor = match ($method) {
                    'rail' => 0.0119,
                    'ship' => 0.0082,
                    default => 0.0739 // Truck (default)
                };

                $transportImpact = $weightTonnes * $dist * $transportFactor;

                $totalScore += ($materialImpact + $transportImpact);

                $entityManager->persist($claimItem);
            }

            $claim->setTotalCarbonScore($totalScore);
            $entityManager->persist($claim);
            $entityManager->flush();

            return $this->json(['status' => 'saved', 'claimId' => $claim->getId()], 201);
        }

        // 2. Handle GET: Return grouped data for Chart & Total from Claims
        $claims = $claimRepo->findAll();
        $grandTotal = 0.0;
        $byCategory = [
            'Transport' => 0.0,
        ];

        $history = []; // Full list of items for Report

        foreach ($claims as $claim) {
            $grandTotal += $claim->getTotalCarbonScore();

            // To get category breakdown, we iterate items
            foreach ($claim->getClaimItems() as $ci) {
                $mat = $ci->getMaterial();
                if ($mat) {
                    $cat = $mat->getCategory();
                    $qty = $ci->getQuantityUsed();

                    // Material Impact
                    $matImpact = $qty * $mat->getCarbonFootprintPerUnit();

                    if (!isset($byCategory[$cat])) {
                        $byCategory[$cat] = 0.0;
                    }
                    $byCategory[$cat] += $matImpact;

                    // Transport Impact (Re-calculate for breakdown)
                    $transImpact = 0.0;
                    $dist = $ci->getTransportDistance() ?? 0;
                    if ($dist > 0) {
                        $density = $mat->getDensity() ?? 0;
                        $weightTonnes = ($qty * $density) / 1000;
                        $method = $ci->getTransportMethod() ?? 'truck';

                        $factor = match ($method) {
                            'rail' => 0.0119,
                            'ship' => 0.0082,
                            default => 0.0739
                        };

                        $transImpact = ($weightTonnes * $dist * $factor);
                        $byCategory['Transport'] += $transImpact;
                    }

                    // Add to history
                    $history[] = [
                        'name' => $mat->getName(),
                        'quantity' => $qty,
                        'unit' => $mat->getUnit(),
                        'totalImpact' => $matImpact + $transImpact,
                        'transportDistance' => $dist,
                        'transportMethod' => $ci->getTransportMethod() ?? 'truck',
                        'date' => $claim->getId() // Using ID/Timestamp roughly
                    ];
                }
            }
        }

        return $this->json([
            'total_score' => round($grandTotal, 2),
            'breakdown' => $byCategory,
            'history' => $history // Sending full history
        ]);
    }
}
