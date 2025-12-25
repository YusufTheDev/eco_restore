import './stimulus_bootstrap.js';
import { registerVueControllerComponents } from '@symfony/ux-vue';
import CarbonDashboard from './vue/controllers/CarbonDashboard.js';

registerVueControllerComponents({
    'CarbonDashboard': CarbonDashboard
});