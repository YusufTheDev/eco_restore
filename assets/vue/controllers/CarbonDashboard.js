import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';

export default {
    template: `
        <div class="dashboard-container">
            <!-- SCREEN ONLY HEADER -->
            <div class="header screen-only">
                <div>
                    <h1>EcoRestore Dashboard</h1>
                    <div style="opacity: 0.8; font-size: 14px; margin-top: 5px;">Project: Building A (Day 3)</div>
                </div>
                <button @click="downloadReport" class="btn-download">Export PDF</button>
            </div>

            <div class="content-grid screen-only">
                <!-- Left Column: Metrics & Form -->
                <div>
                    <div class="metric-box">
                        <div class="metric-label">Total Carbon Footprint</div>
                        <div class="metric-value">
                            {{ totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }} 
                            <span style="font-size: 24px; color: #94a3b8; font-weight: 500;">kgCO₂e</span>
                        </div>
                        
                        <!-- Projected Increase Badge -->
                        <div v-if="stagedTotal > 0" style="margin-top: 10px; font-size: 14px; font-weight: 600; color: #eab308; display: flex; align-items: center; gap: 6px;">
                            <span>▲ +{{ stagedTotal.toFixed(1) }} pending</span>
                            <span style="font-size: 12px; color: #94a3b8; font-weight: 400;">(Proj: {{ projectedTotal.toFixed(1) }})</span>
                        </div>
                    </div>

                    <!-- Recommendation Alert -->
                    <div v-if="recommendation" class="mb-6 mp-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between screen-only" style="margin-bottom: 20px;">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">💡</span>
                            <div>
                                <h4 class="font-bold text-yellow-800" style="margin:0; font-size:14px;">Better Choice Available</h4>
                                <p class="text-sm text-yellow-700" style="margin:0; font-size:12px;">
                                    Switching to <span class="font-bold">{{ recommendation.name }}</span> could save 
                                    <span class="font-bold">{{ recommendation.percent_saving }}%</span> carbon impact.
                                </p>
                            </div>
                        </div>
                        <button @click="applyRecommendation" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium transition-colors" style="border:none; cursor:pointer;">
                            Switch Material
                        </button>
                    </div>

                    <!-- Material Entry Form -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 screen-only">
                        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2" style="margin-top:0;">
                            <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm" style="display:inline-flex; width:24px; height:24px; align-items:center; justify-content:center; border-radius:50%; background:#dbeafe; color:#2563eb; margin-right:8px;">1</span>
                            Add Material
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8" style="display:grid; gap:20px;">
                            <!-- Search Section -->
                            <div class="space-y-4">
                                <label class="block text-sm font-semibold text-gray-700">Material Search</label>
                                <div class="relative" style="position:relative;">
                                    <input 
                                        type="text" 
                                        v-model="searchQuery" 
                                        @input="performSearch"
                                        placeholder="e.g. Pine, Granite, Steel..."
                                        class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px;"
                                    >
                                    
                                    <!-- Search Results Dropdown -->
                                    <div v-if="searchResults.length > 0" class="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto" style="position:absolute; width:100%; background:white; z-index:10; border:1px solid #e2e8f0; border-radius:8px; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                                        <div 
                                            v-for="result in searchResults" 
                                            :key="result.id"
                                            @click="selectMaterial(result)"
                                            class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                            style="padding:10px; cursor:pointer; border-bottom:1px solid #f1f5f9;"
                                        >
                                            <div class="font-medium text-gray-800" style="font-weight:500;">{{ result.name }}</div>
                                            <div class="text-xs text-gray-500 mt-1 flex justify-between" style="font-size:12px; color:#64748b; display:flex; justify-content:space-between;">
                                                <span>{{ result.category }}</span>
                                                <span class="font-mono bg-gray-100 px-2 py-0.5 rounded">{{ result.factor }} kgCO₂e/{{ result.unit }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Selected Item Preview -->
                                <div v-if="newItem.materialId" class="p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in" style="margin-top:10px; background:#eff6ff; padding:15px; border-radius:8px; border:1px solid #dbeafe;">
                                    <div class="flex justify-between items-start mb-2" style="display:flex; justify-content:space-between;">
                                        <div>
                                            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider" style="font-size:10px; font-weight:bold; color:#2563eb;">SELECTED</span>
                                            <h3 class="font-bold text-blue-900 text-lg" style="margin:0; font-size:16px;">{{ newItem.previewName }}</h3>
                                        </div>
                                        <div class="text-right" style="text-align:right;">
                                            <div class="text-2xl font-bold text-blue-600" style="font-size:18px; font-weight:bold;">{{ newItem.selectedFactor }}</div>
                                            <div class="text-xs text-blue-400">kgCO₂e / {{ newItem.previewUnit }}</div>
                                        </div>
                                    </div>
                                    
                                    <!-- RICS Badges -->
                                    <div class="flex flex-wrap gap-2 mt-3" style="display:flex; gap:8px; margin-top:8px;">
                                        <span v-if="newItem.meta.source_date" style="background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-size:11px;">
                                            ✅ Verified {{ newItem.meta.source_date.slice(0,4) }}
                                        </span>
                                        <span v-if="industryComparison" :style="{ background: industryComparison.good ? '#dcfce7' : '#fee2e2', color: industryComparison.good ? '#166534' : '#991b1b' }" style="padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">
                                            {{ industryComparison.label }} ({{ industryComparison.percent }}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Quantity & Transport Section -->
                            <div class="space-y-6">
                                <div style="margin-bottom:15px;">
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantity ({{ newItem.previewUnit || 'units' }})</label>
                                    <input 
                                        type="number" 
                                        v-model="newItem.quantity" 
                                        min="0"
                                        step="0.01"
                                        :disabled="!newItem.materialId"
                                        class="quantity-input w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Amount..."
                                        style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px;"
                                    >
                                </div>

                                <!-- Transport Toggle -->
                                <div class="p-4 bg-gray-50 rounded-lg border border-gray-200" style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px;">
                                    <label class="flex items-center gap-3 cursor-pointer mb-4" style="display:flex; gap:10px; cursor:pointer;">
                                        <input type="checkbox" v-model="newItem.addTransport">
                                        <span class="font-medium text-gray-700">Include Logistics / Transport</span>
                                    </label>

                                    <div v-if="newItem.addTransport" class="grid grid-cols-2 gap-4 animate-fade-in pl-8" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 mb-1" style="font-size:11px;">Method</label>
                                            <select v-model="newItem.transportMethod" class="w-full text-sm rounded-md border-gray-300" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
                                                <option value="truck">Truck (Road)</option>
                                                <option value="rail">Train (Rail)</option>
                                                <option value="ship">Cargo Ship</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 mb-1" style="font-size:11px;">Distance (km)</label>
                                            <input type="number" v-model="newItem.transportDistance" class="w-full text-sm rounded-md border-gray-300" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
                                        </div>
                                        <div class="col-span-2 text-xs text-gray-500 mt-1" style="grid-column: span 2; font-size:11px; color:#64748b;">
                                            + {{ transportImpact.toFixed(2) }} kgCO₂e (Transport Impact)
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    @click="addItem" 
                                    :disabled="!isValidItem"
                                    class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style="width:100%; padding:12px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;"
                                >
                                    <span>Add Item to Claim</span>
                                    <span v-if="isValidItem" class="bg-blue-500 px-2 py-0.5 rounded text-sm" style="background:#3b82f6; padding:2px 6px; border-radius:4px; font-size:12px; margin-left:8px;">
                                        +{{ currentImpact.toFixed(2) }} kg
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Chart -->
                <div style="display: flex; flex-direction: column;">
                    <div style="position: relative; height: 300px; width: 100%;">
                        <canvas id="impactChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Staging and Submission Table (Full Width) -->
            <div v-if="items.length > 0" class="bg-white rounded-xl shadow-lg overflow-hidden mb-8 screen-only" style="margin-top:40px; background:white; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border:1px solid #f1f5f9;">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center" style="padding:20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2" style="margin:0; font-size:20px;">
                        <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm" style="display:inline-flex; width:28px; height:28px; align-items:center; justify-content:center; background:#f3e8ff; color:#9333ea; border-radius:50%; margin-right:8px;">2</span>
                        Review & Submit
                    </h2>
                    <div class="text-sm text-gray-500" style="color:#64748b;">{{ items.length }} items pending</div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full" style="width:100%; border-collapse:collapse;">
                        <thead class="bg-gray-50 text-gray-500 text-xs uppercase" style="background:#f8fafc; font-size:12px; text-transform:uppercase; color:#64748b;">
                            <tr>
                                <th class="px-6 py-3 text-left" style="padding:12px 24px; text-align:left;">Material</th>
                                <th class="px-6 py-3 text-right" style="padding:12px 24px; text-align:right;">Qty</th>
                                <th class="px-6 py-3 text-right" style="padding:12px 24px; text-align:right;">Logistics</th>
                                <th class="px-6 py-3 text-right" style="padding:12px 24px; text-align:right;">Impact</th>
                                <th class="px-6 py-3" style="padding:12px 24px;"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(item, idx) in items" :key="idx" class="hover:bg-gray-50" style="border-bottom:1px solid #f1f5f9;">
                                <td class="px-6 py-4 font-medium text-gray-800" style="padding:16px 24px; font-weight:500;">{{ item.name }}</td>
                                <td class="px-6 py-4 text-right text-gray-600" style="padding:16px 24px; text-align:right;">{{ item.quantity }} {{ item.unit }}</td>
                                <td class="px-6 py-4 text-right text-gray-500 text-sm" style="padding:16px 24px; text-align:right; font-size:13px; color:#64748b;">
                                    <div v-if="item.transportDistance > 0">
                                        {{ item.transportDistance }}km ({{ item.transportMethod }})
                                    </div>
                                    <div v-else>-</div>
                                </td>
                                <td class="px-6 py-4 text-right font-bold text-blue-600" style="padding:16px 24px; text-align:right; font-weight:bold; color:#2563eb;">
                                    {{ item.totalImpact.toFixed(2) }} <span class="text-xs text-gray-400 font-normal" style="font-weight:normal; color:#cbd5e1;">kgCO₂e</span>
                                </td>
                                <td class="px-6 py-4 text-right" style="padding:16px 24px; text-align:right;">
                                    <button @click="items.splice(idx, 1)" class="text-red-400 hover:text-red-600 text-sm" style="color:#f87171; background:none; border:none; cursor:pointer;">✕</button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-purple-50" style="background:#faf5ff;">
                            <tr>
                                <td colspan="3" class="px-6 py-4 text-right font-bold text-purple-900" style="padding:16px 24px; text-align:right; color:#581c87;">Total Pending Impact</td>
                                <td class="px-6 py-4 text-right font-bold text-purple-700 text-lg" style="padding:16px 24px; text-align:right; font-size:18px; color:#7e22ce;">{{ stagedTotal.toFixed(2) }} kg</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="p-6 bg-gray-50 border-t border-gray-100 text-right" style="padding:20px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:right;">
                    <button 
                        @click="submitClaim" 
                        :disabled="loading"
                        class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 ml-auto"
                        style="padding:12px 30px; background:#16a34a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center;"
                    >
                        <span v-if="loading">Processing...</span>
                        <span v-else>Submit Final Claim</span>
                    </button>
                </div>
            </div>

            <!-- Generated PDF Report (Hidden from Screen) -->
            <div class="pdf-report-container" id="pdf-report" style="display:none;">
                <div class="pdf-header">
                    <h1>Carbon Impact Report</h1>
                    <p>Generated on {{ new Date().toLocaleDateString() }}</p>
                </div>

                <div class="pdf-summary-box">
                    <div class="summary-item">
                        <label>Total Carbon Footprint</label>
                        <div class="value">{{ grandTotalReport.toFixed(2) }} <span>kgCO₂e</span></div>
                    </div>
                    <div class="summary-item">
                        <label>Total Items</label>
                        <div class="value">{{ items.length + historyItems.length }}</div>
                    </div>
                </div>

                <!-- Pending Items Section -->
                <div v-if="items.length > 0">
                    <h3 class="section-title">Pending Submission</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Quantity</th>
                                <th>Transport</th>
                                <th class="text-right">Carbon Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in items" :key="'new-'+idx">
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }} {{ item.unit }}</td>
                                 <td>
                                    <span v-if="item.transportDistance > 0">{{ item.transportDistance }}km ({{ item.transportMethod }})</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="text-right font-bold">{{ item.totalImpact.toFixed(2) }} kg</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- History / Submitted Items Section -->
                <div v-if="historyItems.length > 0">
                    <h3 class="section-title">Submitted Items log</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Quantity</th>
                                <th>Transport</th>
                                <th class="text-right">Carbon Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in historyItems" :key="'base-'+idx">
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }} {{ item.unit }}</td>
                                <td>
                                    <span v-if="item.transportDistance > 0">{{ item.transportDistance }}km ({{ item.transportMethod }})</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="text-right font-bold">{{ item.totalImpact.toFixed(2) }} kg</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="pdf-footer">
                    <p>EcoRestore Carbon App - Verified RICS Standard Calculation</p>
                </div>
            </div>

            <div v-if="loading" class="loading-overlay">
                Refreshing Data...
            </div>
        </div>
    `,
    setup() {
        const totalScore = ref(0);
        const loading = ref(true);
        const searchQuery = ref("");
        const searchResults = ref([]);
        const isSearching = ref(false);
        const items = ref([]);
        const historyItems = ref([]); // Saved items from backend

        // Recommendation System
        const recommendation = ref(null); // { name, id, percent_saving }

        // Extended Item State (RICS + Transport)
        const newItem = ref({
            materialId: null,
            quantity: null,
            previewName: '',
            previewUnit: '',
            selectedFactor: 0,
            density: 0,
            meta: {}, // For badges
            // Transport
            addTransport: false,
            transportDistance: 0,
            transportMethod: 'truck'
        });

        let searchTimeout = null;
        let chartInstance = null;
        const quantityInputRef = ref(null);

        // Computed Impacts
        const materialImpact = computed(() => {
            if (!newItem.value.materialId || !newItem.value.quantity) return 0;
            return newItem.value.selectedFactor * newItem.value.quantity;
        });

        const transportImpact = computed(() => {
            if (!newItem.value.addTransport || !newItem.value.quantity) return 0;

            // Robust Density Fallback: Default to 1000 (water/light timber) if DB is empty (0)
            const safeDensity = newItem.value.density && newItem.value.density > 0 ? newItem.value.density : 1000;

            // Weight (tonnes) = (Qty * Density) / 1000
            const weightTonnes = (newItem.value.quantity * safeDensity) / 1000;
            const dist = newItem.value.transportDistance;

            const factors = { truck: 0.0739, rail: 0.0119, ship: 0.0082 };
            const factor = factors[newItem.value.transportMethod] || 0.0739;

            return weightTonnes * dist * factor;
        });

        const currentImpact = computed(() => materialImpact.value + transportImpact.value);

        const industryComparison = computed(() => {
            if (!newItem.value.meta?.industry_average || !newItem.value.selectedFactor) return null;
            const avg = newItem.value.meta.industry_average;
            const current = newItem.value.selectedFactor;
            if (current < avg) {
                const diff = avg - current;
                const percent = Math.round((diff / avg) * 100);
                return { label: `Better than Avg`, percent: percent, good: true };
            }
            return { label: `Above Avg`, percent: Math.round(((current - avg) / avg) * 100), good: false };
        });

        const isValidItem = computed(() => newItem.value.materialId !== null && newItem.value.quantity > 0);
        const stagedTotal = computed(() => items.value.reduce((acc, item) => acc + item.totalImpact, 0));
        const projectedTotal = computed(() => totalScore.value + stagedTotal.value);

        // Full Report Total (Server + Staged)
        const grandTotalReport = computed(() => totalScore.value + stagedTotal.value);

        const fetchStats = async () => {
            try {
                const response = await fetch('/api/carbon-stats');
                const data = await response.json();
                totalScore.value = data.total_score;
                lastBreakdown = data.breakdown;
                historyItems.value = data.history || []; // Store history
                updateChart(data.breakdown);
            } catch (e) {
                console.error("Fetch Stats Error", e);
            } finally {
                loading.value = false;
            }
        };

        const checkRecommendation = async (id) => {
            recommendation.value = null;
            try {
                const res = await fetch(`/api/recommend/${id}`);
                const data = await res.json();
                if (data && data.percent_saving > 5) { // Only show if substantial
                    recommendation.value = data;
                }
            } catch (e) {
                console.error("Recommendation Error", e);
            }
        };

        const applyRecommendation = () => {
            if (!recommendation.value) return;
            // We need to fetch full details for the new item to swap correctly
            // For simplicity, we just swap name/id/factor and assume unit/density similar or need re-fetch.
            // Best to re-fetch lookup logic.
            // UX Shortcut: just clear and search for the recommended name
            searchQuery.value = recommendation.value.name;
            performSearch(); // This will trigger search, user clicks.
        };

        const performSearch = () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            // Smart Reset
            if (newItem.value.materialId) {
                newItem.value.materialId = null;
                // Don't clear name immediately if we are just searching
                newItem.value.meta = {};
                recommendation.value = null;
            }
            isSearching.value = true;
            searchTimeout = setTimeout(async () => {
                if (searchQuery.value.length < 2) {
                    searchResults.value = [];
                    isSearching.value = false;
                    return;
                }
                const res = await fetch(`/api/material-lookup?q=${encodeURIComponent(searchQuery.value)}`);
                searchResults.value = await res.json();
                isSearching.value = false;
            }, 300);
        };

        const selectMaterial = (m) => {
            newItem.value.materialId = m.id;
            newItem.value.previewName = m.name;
            newItem.value.previewUnit = m.unit;
            newItem.value.selectedFactor = m.factor;
            newItem.value.density = m.density || 0;

            newItem.value.meta = {
                source_date: m.source_date,
                industry_average: m.industry_average
            };

            searchQuery.value = m.name;
            searchResults.value = [];

            // Trigger Recommendation Check
            checkRecommendation(m.id);

            setTimeout(() => {
                const qtyInput = document.querySelector('.quantity-input');
                if (qtyInput) qtyInput.focus();
            }, 50);
        };

        const updateChart = (breakdown) => {
            if (chartInstance) {
                const labels = Object.keys(breakdown);
                const data = Object.values(breakdown);
                if (stagedTotal.value > 0) {
                    labels.push('Projected (New)');
                    data.push(stagedTotal.value);
                }
                chartInstance.data.labels = labels;
                chartInstance.data.datasets[0].data = data;
                const baseColors = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
                if (stagedTotal.value > 0) baseColors.push('#facc15');
                chartInstance.data.datasets[0].backgroundColor = baseColors;
                chartInstance.update();
            }
        };

        let lastBreakdown = {};

        const addItem = () => {
            if (isValidItem.value) {
                items.value.push({
                    materialId: newItem.value.materialId,
                    name: newItem.value.previewName,
                    quantity: newItem.value.quantity,
                    factor: newItem.value.selectedFactor,
                    unit: newItem.value.previewUnit,
                    transportDistance: newItem.value.addTransport ? newItem.value.transportDistance : 0,
                    transportMethod: newItem.value.transportMethod,
                    materialImpact: materialImpact.value,
                    transportImpact: transportImpact.value,
                    totalImpact: currentImpact.value
                });

                updateChart(lastBreakdown);

                newItem.value.quantity = null;
                newItem.value.materialId = null;
                newItem.value.previewName = '';
                searchQuery.value = '';
                newItem.value.addTransport = false;
                newItem.value.transportDistance = 0;
                recommendation.value = null;
            }
        };

        const submitClaim = async () => {
            if (items.value.length === 0) return;
            loading.value = true;
            try {
                const payload = items.value.map(i => ({
                    materialId: i.materialId,
                    quantity: i.quantity,
                    transportDistance: i.transportDistance,
                    transportMethod: i.transportMethod
                }));

                await fetch('/api/carbon-stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: payload })
                });
                items.value = [];
                await fetchStats();
            } catch (error) {
                console.error("Submit error:", error);
                loading.value = false;
            }
        };

        const downloadReport = () => {
            // Access global html2pdf from CDN
            const element = document.querySelector('.dashboard-container');
            const pdfContainer = document.querySelector('.pdf-report-container');
            const screenElements = document.querySelectorAll('.screen-only');

            const opt = {
                margin: 10,
                filename: `Carbon_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            element.classList.add('generating-pdf');

            // UI Toggle
            if (pdfContainer) pdfContainer.style.display = 'block';
            screenElements.forEach(el => el.style.display = 'none');

            if (window.html2pdf) {
                window.html2pdf().set(opt).from(element).save().then(() => {
                    element.classList.remove('generating-pdf');
                    // Restore UI
                    if (pdfContainer) pdfContainer.style.display = 'none';
                    screenElements.forEach(el => el.style.display = '');
                });
            } else {
                console.error("html2pdf not found");
                alert("PDF library not loaded.");
                element.classList.remove('generating-pdf');
                if (pdfContainer) pdfContainer.style.display = 'none';
                screenElements.forEach(el => el.style.display = '');
            }
        };

        const robustFetchStats = async () => {
            const response = await fetch('/api/carbon-stats');
            const data = await response.json();
            totalScore.value = data.total_score;
            lastBreakdown = data.breakdown;
            historyItems.value = data.history || [];
            updateChart(data.breakdown);
            loading.value = false;
        };

        onMounted(async () => {
            const ctx = document.getElementById('impactChart');
            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { position: 'bottom' } }
                }
            });
            await robustFetchStats();
        });

        return {
            totalScore, loading, items, newItem, currentImpact, isValidItem, stagedTotal, projectedTotal,
            searchQuery, searchResults, performSearch, selectMaterial, isSearching,
            addItem, submitClaim, downloadReport,
            materialImpact, transportImpact, industryComparison,
            historyItems, grandTotalReport, recommendation, applyRecommendation
        };
    }
}