<?php

namespace App\State;

use App\Entity\Claim;
use App\Service\EmissionCalculator;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\State\ProviderInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class ClaimStateProvider implements ProviderInterface
{
    public function __construct(
            // Inject the built-in Item Provider
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,

            // Inject the built-in Collection Provider
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,

        private EmissionCalculator $calculator
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // 1. Logic Switch: Are we looking for one claim or all of them?
        $provider = $operation instanceof CollectionOperationInterface
            ? $this->collectionProvider
            : $this->itemProvider;

        $data = $provider->provide($operation, $uriVariables, $context);

        // 2. Calculation Logic
        if ($data instanceof Claim) {
            // Process a single item
            $this->calculator->calculateAndSave($data);
        } elseif (is_iterable($data)) {
            // Process every item in the list
            foreach ($data as $claim) {
                if ($claim instanceof Claim) {
                    $this->calculator->calculateAndSave($claim);
                }
            }
        }

        return $data;
    }
}