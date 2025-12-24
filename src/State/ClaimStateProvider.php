<?php

namespace App\State;

use App\Entity\Claim;
use App\Service\EmissionCalculator;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class ClaimStateProvider implements ProviderInterface
{
    public function __construct(
            // We inject the original "built-in" provider to get the data from the DB first
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        private EmissionCalculator $calculator
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // 1. Get the Claim from the database
        $claim = $this->itemProvider->provide($operation, $uriVariables, $context);

        if ($claim instanceof Claim) {
            // 2. Use Yusuf's calculator to get the real-time score
            $score = $this->calculator->calculateTotalCarbon($claim);
            $claim->setTotalCarbonScore($score);
        }

        return $claim;
    }
}