import { ref, onMounted } from 'vue';

export default {
    setup() {
        const projects = ref([]);
        const loading = ref(true);
        const newProjectName = ref('');
        const error = ref(null);

        const fetchProjects = async () => {
            loading.value = true;
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) throw new Error('Failed to fetch projects');
                projects.value = await response.json();
            } catch (e) {
                error.value = e.message;
            } finally {
                loading.value = false;
            }
        };

        const createProject = async () => {
            if (!newProjectName.value.trim()) return;

            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newProjectName.value })
                });

                if (!response.ok) throw new Error('Failed to create project');

                newProjectName.value = '';
                await fetchProjects();
            } catch (e) {
                error.value = e.message;
            }
        };

        const deleteProject = async (id) => {
            if (!confirm('Are you sure you want to delete this project? All claims will be lost.')) return;

            try {
                const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete project');
                await fetchProjects();
            } catch (e) {
                error.value = e.message;
            }
        };

        const selectProject = (id) => {
            // Redirect to dashboard with query param or route param
            // Assuming we use query param for now as it's easier with simple router
            window.location.href = `/dashboard?projectId=${id}`;
        };

        onMounted(fetchProjects);

        return {
            projects,
            loading,
            newProjectName,
            createProject,
            deleteProject,
            selectProject,
            error
        };
    },
    template: `
        <div class="p-6 max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-6 text-gray-800">My Projects</h1>

            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
            </div>

            <div class="mb-8 p-4 bg-white rounded shadow">
                <h2 class="text-xl font-semibold mb-4">Create New Project</h2>
                <div class="flex gap-2">
                    <input 
                        v-model="newProjectName" 
                        type="text" 
                        placeholder="Project Name (e.g. Day 4 Refactor)" 
                        class="flex-1 p-2 border rounded"
                        @keyup.enter="createProject"
                    >
                    <button 
                        @click="createProject" 
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        :disabled="!newProjectName"
                    >
                        Create
                    </button>
                </div>
            </div>

            <div v-if="loading" class="text-center text-gray-500">Loading projects...</div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div 
                    v-for="project in projects" 
                    :key="project.id" 
                    class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer relative overflow-hidden"
                    @click="selectProject(project.id)"
                >
                    <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                    <div class="relative z-10 flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{{ project.name }}</h3>
                            <p class="text-slate-400 text-xs mt-1 font-medium">{{ project.createdAt }}</p>
                        </div>
                        <button 
                            @click.stop="deleteProject(project.id)" 
                            class="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full" 
                            title="Delete Project"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="relative z-10 mt-6 pt-4 border-t border-slate-50">
                        <div class="flex flex-col gap-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Carbon Impact</span>
                            <div class="flex items-baseline gap-1.5">
                                <span class="text-3xl font-extrabold text-slate-800 tracking-tight">
                                    {{ (project.carbonScore || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) }}
                                </span>
                                <span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    kgCO₂e
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!loading && projects.length === 0" class="text-center text-gray-500 mt-8">
                No projects found. Create one to get started!
            </div>
        </div>
    `
};
