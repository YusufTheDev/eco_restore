<?php

return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    '@hotwired/stimulus' => [
        'version' => '3.2.2',
    ],
    '@symfony/stimulus-bundle' => [
        'path' => './vendor/symfony/stimulus-bundle/assets/dist/loader.js',
    ],
    '@hotwired/turbo' => [
        'version' => '7.3.0',
    ],
    // Let Symfony find Vue automatically via version
    'vue' => [
        'version' => '3.5.22',
    ],
    '@vue/runtime-dom' => [ 'version' => '3.5.22' ],
    '@vue/compiler-dom' => [ 'version' => '3.5.26' ],
    '@vue/shared' => [ 'version' => '3.5.22' ],
    '@vue/runtime-core' => [ 'version' => '3.5.22' ],
    '@vue/compiler-core' => [ 'version' => '3.5.26' ],
    '@vue/reactivity' => [ 'version' => '3.5.22' ],
    // Critical: Use the local path for the loader
    '@symfony/ux-vue' => [
        'path' => './vendor/symfony/ux-vue/assets/dist/loader.js',
    ],
    'chart.js' => [
        'version' => '4.5.1',
    ],
    '@kurkle/color' => [
        'version' => '0.3.4',
    ],
];