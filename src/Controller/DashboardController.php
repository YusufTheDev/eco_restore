<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class DashboardController extends AbstractController
{
    #[Route('/projects', name: 'app_home')]
    #[Route('/', name: 'app_root')]
    public function projects(): Response
    {
        return $this->render('projects/index.html.twig');
    }

    #[Route('/dashboard', name: 'app_dashboard')]
    public function dashboard(Request $request): Response
    {
        $projectId = $request->query->get('projectId');

        // If no project ID, redirect to projects list
        if (!$projectId) {
            return $this->redirectToRoute('app_home');
        }

        return $this->render('dashboard/index.html.twig', [
            'projectId' => $projectId
        ]);
    }
}