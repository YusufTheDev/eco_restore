<?php

namespace App\Controller;

use App\Entity\Claim;
use App\Entity\ClaimItem;
use App\Entity\Material;
use App\Entity\Project;
use App\Repository\ClaimRepository;
use App\Repository\MaterialRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class ApiController extends AbstractController
{
    #[Route('/api/material-lookup', name: 'api_material_lookup', methods: ['GET'])]
    public function getMaterials(Request $request, MaterialRepository $repo): JsonResponse
    {
        try {
            $q = $request->query->get('q', '');

            $queryBuilder = $repo->createQueryBuilder('m')
                ->orderBy('m.name', 'ASC')
                ->setMaxResults(5);

            if ($q) {
                // Case-insensitive search
                $queryBuilder->andWhere('LOWER(m.name) LIKE LOWER(:search)')
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
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
        }
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

    // --- PROJECT MANAGEMENT API ---

    #[Route('/api/projects', name: 'api_projects_list', methods: ['GET'])]
    public function listProjects(): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user)
            return $this->json(['error' => 'Unauthorized'], 401);

        $projects = $user->getProjects();
        $data = [];
        foreach ($projects as $p) {
            $data[] = [
                'id' => $p->getId(),
                'name' => $p->getName(),
                'description' => $p->getDescription(),
                'createdAt' => $p->getCreatedAt()->format('Y-m-d H:i:s'),
                'carbonScore' => $p->getCarbonScore(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/projects', name: 'api_projects_create', methods: ['POST'])]
    public function createProject(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user)
            return $this->json(['error' => 'Unauthorized'], 401);

        $data = $request->toArray();
        $project = new Project();
        $project->setName($data['name'] ?? 'New Project');
        $project->setDescription($data['description'] ?? '');
        $project->setUser($user);

        $em->persist($project);
        $em->flush();

        return $this->json(['id' => $project->getId(), 'name' => $project->getName()], 201);
    }

    #[Route('/api/projects/{id}', name: 'api_projects_delete', methods: ['DELETE'])]
    public function deleteProject(int $id, ProjectRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user)
            return $this->json(['error' => 'Unauthorized'], 401);

        $project = $repo->find($id);

        if (!$project || $project->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $em->remove($project);
        $em->flush();

        return $this->json(['status' => 'deleted']);
    }

    // --- DASHBOARD API (Context-Aware) ---

    #[Route('/api/carbon-stats', name: 'api_carbon_stats', methods: ['GET', 'POST'])]
    public function handleStats(
        Request $request,
        EntityManagerInterface $entityManager,
        ClaimRepository $claimRepo,
        MaterialRepository $materialRepo,
        ProjectRepository $projectRepo
    ): JsonResponse {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user)
            return $this->json(['error' => 'Unauthorized'], 401);

        try {
            // 1. Handle POST: Save new Claim with LinkItems
            if ($request->isMethod('POST')) {
                $data = $request->toArray();

                $projectId = $data['projectId'] ?? null;
                if (!$projectId)
                    return $this->json(['error' => 'Project ID required'], 400);

                $project = $projectRepo->find($projectId);
                if (!$project || $project->getUser() !== $user) {
                    return $this->json(['error' => 'Invalid Project Access'], 403);
                }

                $claim = new Claim();
                $claim->setClaimNumber('CLM-' . uniqid());
                $claim->setPolicyHolder($user->getEmail()); // Use User email
                $claim->setProject($project);

                $totalScore = 0.0;

                foreach ($data['items'] as $item) {
                    $material = $materialRepo->find($item['materialId']);
                    if (!$material)
                        continue;

                    $qty = (float) $item['quantity'];

                    $claimItem = new ClaimItem();
                    $claimItem->setMaterial($material);
                    $claimItem->setQuantityUsed($qty);

                    // Transport
                    $dist = (float) ($item['transportDistance'] ?? 0);
                    $method = $item['transportMethod'] ?? 'truck';

                    $claimItem->setTransportDistance($dist);
                    $claimItem->setTransportMethod($method);

                    // Link both ways
                    $claim->addClaimItem($claimItem);

                    // 1. Material Impact
                    $materialImpact = $qty * $material->getCarbonFootprintPerUnit();

                    // 2. Transport Impact
                    $density = $material->getDensity() ?? 0;
                    $weightTonnes = ($qty * $density) / 1000;

                    $transportFactor = match ($method) {
                        'rail' => 0.0119,
                        'ship' => 0.0082,
                        default => 0.0739
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
            $projectId = $request->query->get('projectId');
            if (!$projectId)
                return $this->json(['error' => 'Project ID required'], 400);

            $project = $projectRepo->find($projectId);
            if (!$project || $project->getUser() !== $user) {
                return $this->json(['error' => 'Invalid Project Access'], 403);
            }

            $claims = $claimRepo->findBy(['project' => $project]);
            $grandTotal = 0.0;
            $byCategory = [];
            $history = [];

            foreach ($claims as $claim) {
                $grandTotal += $claim->getTotalCarbonScore();

                foreach ($claim->getClaimItems() as $ci) {
                    $mat = $ci->getMaterial();
                    if ($mat) {
                        $cat = $mat->getCategory();
                        $qty = $ci->getQuantityUsed();
                        $matImpact = $qty * $mat->getCarbonFootprintPerUnit();

                        if (!isset($byCategory[$cat])) {
                            $byCategory[$cat] = 0.0;
                        }
                        $byCategory[$cat] += $matImpact;

                        $transImpact = 0.0;
                        $dist = $ci->getTransportDistance() ?? 0;
                        if ($dist > 0) {
                            $density = $mat->getDensity() ?: 1000;
                            $weightTonnes = ($qty * $density) / 1000;
                            $method = $ci->getTransportMethod() ?? 'truck';
                            $factor = match ($method) { 'rail' => 0.0119, 'ship' => 0.0082, default => 0.0739};

                            $currentTransImpact = ($weightTonnes * $dist * $factor);
                            if ($currentTransImpact > 0) {
                                if (!isset($byCategory['Transport']))
                                    $byCategory['Transport'] = 0.0;
                                $byCategory['Transport'] += $currentTransImpact;
                            }
                            $transImpact = $currentTransImpact;
                        }

                        $history[] = [
                            'id' => $ci->getId(),
                            'name' => $mat->getName(),
                            'quantity' => $qty,
                            'unit' => $mat->getUnit(),
                            'totalImpact' => $matImpact + $transImpact,
                            'transportDistance' => $dist,
                            'date' => $claim->getClaimNumber()
                        ];
                    }
                }
            }

            return $this->json([
                'total_score' => round($grandTotal, 2),
                'breakdown' => $byCategory,
                'history' => $history
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
        }
    }

    #[Route('/api/claim-items/{id}', name: 'api_claim_items_delete', methods: ['DELETE'])]
    public function deleteClaimItem(int $id, \App\Repository\ClaimItemRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user)
            return $this->json(['error' => 'Unauthorized'], 401);

        $item = $repo->find($id);
        if (!$item)
            return $this->json(['error' => 'Not found'], 404);

        // Security Check: Ensure user owns the project this item belongs to
        $project = $item->getClaim()->getProject();
        if ($project->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        // Subtract from Claim Total (Optional but good for consistency, though re-calc might be better)
        // For now, we rely on the next GET /api/carbon-stats to re-sum everything from scratch
        // But the Claim entity stores a total. We should update it or just let it be inconsistent until re-save?
        // Actually, the GET /api/carbon-stats sums items dynamically for the "Total Score" response?
        // Let's look at GET:
        // $grandTotal += $claim->getTotalCarbonScore();
        // So it uses the stored total. We MUST update the stored total on the Claim.

        $claim = $item->getClaim();
        $claim->setTotalCarbonScore($claim->getTotalCarbonScore() - $item->getTotalCarbonImpact()); // Need helper or calc manually

        // Easier: Remove item, then re-calculate claim total
        $em->remove($item);
        $em->flush(); // Item gone

        // Recalculate Claim Total
        $newTotal = 0.0;
        foreach ($claim->getClaimItems() as $ci) {
            // Re-calculate impact (logic duped from handleStats, ideal refactor later)
            $mat = $ci->getMaterial();
            if ($mat) {
                $mImpact = $ci->getQuantityUsed() * $mat->getCarbonFootprintPerUnit();
                $tImpact = 0;
                if ($ci->getTransportDistance() > 0) {
                    $d = $mat->getDensity() ?? 0;
                    $w = ($ci->getQuantityUsed() * $d) / 1000;
                    $f = match ($ci->getTransportMethod()) { 'rail' => 0.0119, 'ship' => 0.0082, default => 0.0739};
                    $tImpact = $w * $ci->getTransportDistance() * $f;
                }
                $newTotal += ($mImpact + $tImpact);
            }
        }
        $claim->setTotalCarbonScore($newTotal);
        $em->flush();

        return $this->json(['status' => 'deleted']);
    }
}
