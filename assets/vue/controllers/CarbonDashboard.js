import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';

export default {
    props: ['projectId'],
    template: `
        <div class="dashboard-container w-full min-h-screen bg-slate-50/50 font-sans pb-20">
            <!-- HEADER SECTION -->
            <div class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30 screen-only">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex flex-col md:flex-row justify-between items-center h-auto md:h-20 py-4 md:py-0 gap-4">
                        <div class="flex items-center gap-4 w-full md:w-auto">
                            <a href="/projects" class="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-100 transition-all" title="Back to Projects">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </a>
                            <div>
                                <h1 class="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-none">Project Dashboard</h1>
                                <div class="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                                    <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">ID: {{ projectId }}</span>
                                    <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span class="text-green-600 flex items-center gap-1.5">
                                        <span class="relative flex h-2 w-2">
                                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button @click="downloadReport" class="w-full md:w-auto group flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95">
                            <span class="text-lg leading-none group-hover:-translate-y-0.5 transition-transform duration-300">📄</span>
                            <span>Export Full Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 screen-only">
                
                <!-- TOP STATS ROW -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Total Impact Card -->
                    <div class="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-slate-100 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-40 w-40" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                        </div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="bg-blue-50 text-blue-700 p-1.5 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" /></svg>
                                </span>
                                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Carbon Footprint</h3>
                            </div>
                            <div class="flex items-baseline gap-3 mt-4">
                                <span class="text-5xl font-extrabold text-slate-900 tracking-tight">
                                    {{ totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
                                </span>
                                <span class="text-xl font-medium text-slate-400">kgCO₂e</span>
                            </div>
                             <!-- Projected Increase -->
                            <div v-if="stagedTotal > 0" class="mt-4 inline-flex items-center gap-3 bg-slate-50 border border-slate-100 pr-4 pl-3 py-1.5 rounded-full">
                                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span class="font-semibold text-slate-700 text-sm">+{{ stagedTotal.toFixed(1) }} pending</span>
                                <span class="text-xs text-slate-400 pl-2 border-l border-slate-200">Proj: {{ projectedTotal.toFixed(1) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Card -->
                    <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-slate-100 flex flex-col justify-between">
                         <div class="flex items-center justify-between mb-4">
                             <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Breakdown</h3>
                         </div>
                         <div class="relative h-40 w-full flex items-center justify-center">
                              <canvas id="impactChart"></canvas>
                         </div>
                         </div>
                    </div>


                <!-- MAIN WORKSPACE ROW -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <!-- LEFT COLUMN: ADD MATERIAL (Span 8) -->
                    <div class="lg:col-span-8 space-y-6">
                        
                        <!-- Recommendation Banner -->
                         <div v-if="recommendation" class="p-1 bg-gradient-to-r from-amber-200 via-orange-100 to-amber-100 rounded-2xl shadow-sm">
                            <div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="bg-amber-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-800">Optimization Available</h4>
                                        <p class="text-sm text-slate-600 mt-0.5" >
                                            Switch to <span class="font-bold text-amber-700 border-b border-amber-300/50">{{ recommendation.name }}</span> to reduce impact by 
                                            <span class="font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">{{ recommendation.percent_saving }}%</span>.
                                        </p>
                                    </div>
                                </div>
                                <button @click="applyRecommendation" class="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black text-sm font-bold shadow-lg shadow-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                    Apply Change
                                </button>
                            </div>
                        </div>

                        <!-- Add Material Card -->
                        <div class="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-visible">
                            <div class="p-6 border-b border-slate-50 flex justify-between items-center">
                                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span class="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold shadow-md shadow-blue-200">1</span>
                                    Add New Material
                                </h3>
                                <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Entry Form</div>
                            </div>
                            
                            <div class="p-6 md:p-8 space-y-8">
                                <!-- Search Input -->
                                <div class="relative group z-20">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        v-model="searchQuery" 
                                        @input="performSearch"
                                        placeholder="Type to search (e.g. Concrete, Steel, Wood...)"
                                        class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-lg placeholder-slate-400"
                                    >
                                    <!-- Dropdown -->
                                    <div v-if="searchResults.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-black/5 max-h-80 overflow-y-auto">
                                        <div 
                                            v-for="result in searchResults" 
                                            :key="result.id"
                                            @click="selectMaterial(result)"
                                            class="p-4 hover:bg-blue-50/50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group flex justify-between items-center"
                                        >
                                            <div>
                                                <div class="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{{ result.name }}</div>
                                                <div class="text-xs font-medium text-slate-500 mt-0.5">{{ result.category }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-mono font-bold text-slate-700">{{ result.factor }}</div>
                                                <div class="text-[10px] uppercase font-bold text-slate-400">kgCO₂e / {{ result.unit }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Selection & Config Grid -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <!-- Selected Preview -->
                                    <div class="space-y-4">
                                        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Material</label>
                                        <div v-if="newItem.materialId" class="h-40 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between relative overflow-hidden">
                                            <div class="relative z-10">
                                                <h4 class="font-bold text-blue-900 text-lg leading-tight line-clamp-2" :title="newItem.previewName">{{ newItem.previewName }}</h4>
                                                <div class="mt-2 text-sm text-blue-600/80 font-medium flex items-center gap-1.5">
                                                     <span class="bg-white/50 px-2 py-0.5 rounded text-xs border border-blue-100/50">{{ newItem.previewUnit }}</span>
                                                     <span v-if="newItem.meta.source_date" class="bg-green-100/80 text-green-700 px-2 py-0.5 rounded text-xs border border-green-200/50">Verified {{ newItem.meta.source_date.slice(0,4) }}</span>
                                                </div>
                                            </div>
                                            <div class="relative z-10 pt-4 border-t border-blue-100/50 mt-auto flex justify-between items-end">
                                                <span class="text-3xl font-bold text-blue-700 tracking-tight">{{ newItem.selectedFactor }}</span>
                                                <span class="text-xs font-bold text-blue-400 uppercase mb-1">Impact Factor</span>
                                            </div>
                                            <!-- Decorative bg pattern -->
                                            <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
                                        </div>
                                        <div v-else class="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <span class="text-sm font-semibold">Search and select a material to begin</span>
                                        </div>
                                    </div>

                                    <!-- Configuration Inputs -->
                                    <div class="space-y-6">
                                        <div class="space-y-2">
                                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Quantity</label>
                                            <div class="flex items-center">
                                                <input 
                                                    type="number" 
                                                    v-model="newItem.quantity" 
                                                    min="0"
                                                    step="0.01"
                                                    :disabled="!newItem.materialId"
                                                    class="quantity-input w-full px-5 py-3 rounded-l-xl border-y border-l border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg transition-all"
                                                    placeholder="0.00"
                                                >
                                                <div class="bg-slate-100 px-4 py-3 border border-slate-200 rounded-r-xl text-slate-500 font-bold text-sm min-w-[3.5rem] text-center">
                                                    {{ newItem.previewUnit || '-' }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Simple Transport Toggle -->
                                        <div :class="{'bg-slate-50 border-slate-200': !newItem.addTransport, 'bg-blue-50/30 border-blue-100': newItem.addTransport}" class="border rounded-xl p-4 transition-colors">
                                            <label class="flex items-center justify-between cursor-pointer select-none">
                                                <span class="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                                    Add Logistics
                                                </span>
                                                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                    <input type="checkbox" v-model="newItem.addTransport" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600"/>
                                                    <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-200 cursor-pointer"></label>
                                                </div>
                                            </label>
                                            
                                            <div v-show="newItem.addTransport" class="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-3">
                                                 <select v-model="newItem.transportMethod" class="w-full text-sm rounded-lg border-slate-300 focus:ring-blue-500 py-2">
                                                    <option value="truck">Truck</option>
                                                    <option value="rail">Train</option>
                                                    <option value="ship">Ship</option>
                                                </select>
                                                <div class="relative">
                                                     <input type="number" v-model="newItem.transportDistance" class="w-full text-sm rounded-lg border-slate-300 focus:ring-blue-500 py-2 pr-8" placeholder="Dist">
                                                     <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">km</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Add Button -->
                                        <button 
                                            @click="addItem" 
                                            :disabled="!isValidItem"
                                            class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                                        >
                                            <span class="text-lg">Add to Claim</span>
                                            <span v-if="isValidItem" class="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm font-mono group-hover:bg-white/30 transition-colors">
                                                +{{ currentImpact.toFixed(2) }}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: PENDING ITEMS (Span 4) -->
                    <div class="lg:col-span-4 space-y-6">
                        <div class="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 min-h-[500px] flex flex-col">
                             <div class="p-6 border-b border-slate-50">
                                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span class="bg-purple-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold shadow-md shadow-purple-200">2</span>
                                    Pending Review
                                </h3>
                            </div>
                            
                            <div class="flex-grow p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                                <div v-if="items.length === 0" class="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-12">
                                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p class="text-sm font-medium">No items staged yet.<br>Add some materials to see them here.</p>
                                </div>
                                
                                <ul v-else class="space-y-3">
                                    <li v-for="(item, idx) in items" :key="idx" class="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group relative">
                                        <button @click="items.splice(idx, 1)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <div class="pr-6">
                                            <h5 class="font-bold text-slate-800 text-sm truncate" :title="item.name">{{ item.name }}</h5>
                                            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <span class="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{{ item.quantity }} {{ item.unit }}</span>
                                                <span v-if="item.transportDistance > 0" class="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    {{ item.transportDistance }}km
                                                </span>
                                            </div>
                                            <div class="mt-2 pt-2 border-t border-slate-200/50 flex justify-end">
                                                <span class="font-bold text-blue-700 text-sm">{{ item.totalImpact.toFixed(2) }} kgCO₂e</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div class="p-6 border-t border-slate-50 bg-slate-50/50">
                                <div class="flex justify-between items-center mb-4">
                                    <span class="text-sm font-bold text-slate-500 uppercase">Pending Total</span>
                                    <span class="text-xl font-extrabold text-slate-800">{{ stagedTotal.toFixed(2) }}</span>
                                </div>
                                <button 
                                    @click="submitClaim" 
                                    :disabled="loading || items.length === 0"
                                    class="w-full py-3 bg-slate-900 text-white rounded-lg font-bold shadow-lg shadow-slate-300 hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                                >
                                    {{ loading ? 'Processing...' : 'Submit Claim' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- HISTORY SECTION -->
                <div v-if="historyItems.length > 0" class="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-50">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                             <span class="bg-slate-200 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
                             Project History
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                <tr>
                                    <th class="px-6 py-4 w-32">Date</th>
                                    <th class="px-6 py-4">Material</th>
                                    <th class="px-6 py-4 text-right w-32">Qty</th>
                                    <th class="px-6 py-4 text-right w-32">Logistics</th>
                                    <th class="px-6 py-4 text-right w-32">Impact</th>
                                    <th class="px-6 py-4 text-right w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr v-for="(item, idx) in historyItems" :key="'hist-'+idx" class="group hover:bg-blue-50/30 transition-colors">
                                    <td class="px-6 py-4 text-xs font-mono text-slate-400 group-hover:text-blue-400 whitespace-nowrap">{{ item.date }}</td>
                                    <td class="px-6 py-4">
                                        <div class="font-bold text-slate-700 text-sm truncate max-w-[200px]" :title="item.name">{{ item.name }}</div>
                                        <div class="text-[10px] text-slate-400">{{ item.unit }}</div>
                                    </td>
                                    <td class="px-6 py-4 text-right font-mono text-sm text-slate-600">{{ item.quantity }}</td>
                                    <td class="px-6 py-4 text-right text-xs text-slate-500">
                                        <span v-if="item.transportDistance > 0" class="px-2 py-1 bg-slate-100 rounded-full">{{ item.transportDistance }}km</span>
                                        <span v-else class="text-slate-300">-</span>
                                    </td>
                                    <td class="px-6 py-4 text-right font-bold text-slate-800 text-sm">
                                        {{ item.totalImpact.toFixed(2) }}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button @click="deleteItem(item.id)" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all" title="Delete Item">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <!-- PDF Report (Hidden for display, used for generation) -->
            <div class="pdf-report-container bg-white p-8" id="pdf-report" style="display:none; width: 210mm; min-height: 297mm; color: #333; font-family: sans-serif;">
                <div class="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 mb-2">Carbon Impact Report</h1>
                        <p class="text-slate-500">Project ID: {{ projectId }}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-4xl font-extrabold text-slate-900">{{ grandTotalReport.toFixed(2) }}</div>
                        <div class="text-sm font-bold text-slate-500 uppercase tracking-wider">kgCO₂e Total</div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-between">
                         <div>
                            <span class="block text-xs font-bold text-slate-400 uppercase">Generated On</span>
                            <span class="block font-medium">{{ new Date().toLocaleDateString() }}</span>
                         </div>
                         <div class="text-right">
                             <span class="block text-xs font-bold text-slate-400 uppercase">Status</span>
                             <span class="block font-medium text-green-600">Active</span>
                         </div>
                    </div>

                    <div>
                        <h3 class="font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Material Breakdown</h3>
                        <table class="w-full text-sm text-left">
                            <thead class="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                                <tr>
                                    <th class="px-3 py-2">Material</th>
                                    <th class="px-3 py-2 text-right">Qty</th>
                                    <th class="px-3 py-2 text-right">Factor</th>
                                    <th class="px-3 py-2 text-right">Impact</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(item, idx) in historyItems" :key="'rpt-'+idx">
                                    <td class="px-3 py-2 font-medium">{{ item.name }}</td>
                                    <td class="px-3 py-2 text-right font-mono">{{ item.quantity }} {{ item.unit }}</td>
                                    <td class="px-3 py-2 text-right text-slate-500">{{ (item.totalImpact / item.quantity).toFixed(2) }}</td>
                                    <td class="px-3 py-2 text-right font-bold">{{ item.totalImpact.toFixed(2) }}</td>
                                </tr>
                                <tr v-if="historyItems.length === 0">
                                    <td colspan="4" class="px-3 py-4 text-center text-slate-400 italic">No recorded items yet.</td>
                                </tr>
                            </tbody>
                            <tfoot class="border-t-2 border-slate-200 font-bold">
                                <tr>
                                    <td colspan="3" class="px-3 py-3 text-right uppercase text-xs">Total Impact</td>
                                    <td class="px-3 py-3 text-right">{{ grandTotalReport.toFixed(2) }}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                <div class="mt-12 text-center text-xs text-slate-400 pt-8 border-t border-slate-100">
                    <p>EcoRestore Carbon Tracking System</p>
                </div>
            </div>

             <!-- Loading Overlay -->
             <div v-if="loading" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
                <div class="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-6 transform scale-100 animate-in fade-in zoom-in duration-200">
                    <div class="relative">
                        <div class="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="font-bold text-slate-800 text-lg">Updating...</div>
                        <div class="text-slate-500 text-sm">Synchronizing data</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup(props) {
        const totalScore = ref(0);
        const loading = ref(true);
        const searchQuery = ref("");
        const searchResults = ref([]);
        const isSearching = ref(false);
        const items = ref([]);
        const historyItems = ref([]);
        const recommendation = ref(null);
        const newItem = ref({
            materialId: null,
            quantity: null,
            previewName: '',
            previewUnit: '',
            selectedFactor: 0,
            density: 0,
            meta: {},
            addTransport: false,
            transportDistance: 0,
            transportMethod: 'truck'
        });

        let searchTimeout = null;
        let chartInstance = null;
        const quantityInputRef = ref(null);

        const materialImpact = computed(() => {
            if (!newItem.value.materialId || !newItem.value.quantity) return 0;
            return newItem.value.selectedFactor * newItem.value.quantity;
        });

        const transportImpact = computed(() => {
            if (!newItem.value.addTransport || !newItem.value.quantity) return 0;

            let weightTonnes = 0;
            const unit = newItem.value.previewUnit; // e.g., 'kg', 'liters', 'm3'
            const qty = newItem.value.quantity;
            const density = newItem.value.density; // kg/unit

            if (unit === 'kg') {
                weightTonnes = qty / 1000;
            } else if (unit === 'kWh') {
                return 0; // No transport emissions for grid energy
            } else if (density && density > 0) {
                // For volume/liquid units (liters, m3, m2, etc.), use density to convert to kg
                weightTonnes = (qty * density) / 1000;
            } else {
                // Fallback: Assume input is kg if unsure
                weightTonnes = qty / 1000;
            }

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
        const grandTotalReport = computed(() => totalScore.value + stagedTotal.value);

        const fetchStats = async () => {
            // Pass projectId if available
            const pid = props.projectId ? `?projectId=${props.projectId}` : '';
            await robustFetchStats(pid);
        };

        const checkRecommendation = async (id) => {
            recommendation.value = null;
            try {
                const res = await fetch(`/api/recommend/${id}`);
                const data = await res.json();
                if (data && data.percent_saving > 5) {
                    recommendation.value = data;
                }
            } catch (e) {
                console.error("Recommendation Error", e);
            }
        };

        const applyRecommendation = () => {
            if (!recommendation.value) return;
            searchQuery.value = recommendation.value.name;
            performSearch();
        };

        const performSearch = () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            if (newItem.value.materialId) {
                newItem.value.materialId = null;
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
                try {
                    const res = await fetch(`/api/material-lookup?q=${encodeURIComponent(searchQuery.value)}`);
                    if (!res.ok) throw new Error(`Server Error: ${res.status}`);
                    searchResults.value = await res.json();
                } catch (e) {
                    console.error("Search failed", e);
                    alert("Material Search Failed: " + e.message);
                    searchResults.value = [];
                } finally {
                    isSearching.value = false;
                }
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
                // Updated Diverse Palette: Red, Blue, Yellow, Purple, Orange, Cyan
                const baseColors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#10b981'];
                if (stagedTotal.value > 0) baseColors.push('#64748b'); // Grey for projected
                chartInstance.data.datasets[0].backgroundColor = baseColors;
                chartInstance.update();
            }
        };

        let lastBreakdown = {};

        const deleteItem = async (id) => {
            if (!confirm('Are you sure you want to delete this item?')) return;

            loading.value = true;
            try {
                const response = await fetch(`/api/claim-items/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error(`Delete failed: ${response.statusText}`);
                }
                await fetchStats();
            } catch (e) {
                console.error("Delete failed", e);
                alert("Failed to delete item. Please try again.");
            } finally {
                loading.value = false;
            }
        };

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

                // Include projectId in body
                const body = { items: payload };
                if (props.projectId) body.projectId = props.projectId;

                await fetch('/api/carbon-stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                items.value = [];
                await fetchStats();
            } catch (error) {
                console.error("Submit error:", error);
                loading.value = false;
            }
        };

        const downloadReport = () => {
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
            if (pdfContainer) pdfContainer.style.display = 'block';
            screenElements.forEach(el => el.style.display = 'none');
            if (window.html2pdf) {
                window.html2pdf().set(opt).from(element).save().then(() => {
                    element.classList.remove('generating-pdf');
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

        const robustFetchStats = async (queryString = '') => {
            try {
                const response = await fetch('/api/carbon-stats' + queryString);
                if (!response.ok) throw new Error('Fetch failed');
                const data = await response.json();
                totalScore.value = data.total_score;
                lastBreakdown = data.breakdown;
                historyItems.value = data.history || [];
                updateChart(data.breakdown);
            } catch (e) {
                console.error(e);
            } finally {
                loading.value = false;
            }
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

            // Initial Fetch
            const pid = props.projectId ? `?projectId=${props.projectId}` : '';
            await robustFetchStats(pid);
        });

        return {
            projectId: props.projectId,
            totalScore, loading, items, newItem, currentImpact, isValidItem, stagedTotal, projectedTotal,
            searchQuery, searchResults, performSearch, selectMaterial, isSearching,
            addItem, submitClaim, downloadReport,
            materialImpact, transportImpact, industryComparison,
            historyItems, grandTotalReport, recommendation, applyRecommendation, deleteItem
        };
    }
}