import './stimulus_bootstrap.js';
import './styles/dashboard.css';
import { registerVueControllerComponents } from '@symfony/ux-vue';
import CarbonDashboard from './vue/controllers/CarbonDashboard.js';

registerVueControllerComponents({
    'CarbonDashboard': CarbonDashboard
});