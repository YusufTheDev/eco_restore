<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 */
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
    '@vue/runtime-dom' => [
        'version' => '3.5.26',
    ],
    '@vue/compiler-dom' => [
        'version' => '3.5.26',
    ],
    '@vue/shared' => [
        'version' => '3.5.26',
    ],
    '@vue/runtime-core' => [
        'version' => '3.5.26',
    ],
    '@vue/compiler-core' => [
        'version' => '3.5.26',
    ],
    '@vue/reactivity' => [
        'version' => '3.5.26',
    ],
    '@symfony/ux-vue' => [
        'path' => '@symfony/ux-vue/loader.js',
    ],
    '@symfony/ux-vue/render_controller.js' => [
        'path' => '@symfony/ux-vue/render_controller.js',
    ],
    'chart.js' => [
        'version' => '4.5.1',
    ],
    '@kurkle/color' => [
        'version' => '0.3.4',
    ],
    'vue' => [
        'version' => '3.5.26',
    ],
    'chart.js/auto' => [
        'version' => '4.5.1',
    ],
];