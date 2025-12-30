import './stimulus_bootstrap.js';
import './styles/dashboard.css';
import { registerVueControllerComponents } from '@symfony/ux-vue';
import CarbonDashboard from './vue/controllers/CarbonDashboard.js';
import ProjectList from './vue/controllers/ProjectList.js';

registerVueControllerComponents({
    'CarbonDashboard': CarbonDashboard,
    'ProjectList': ProjectList
});