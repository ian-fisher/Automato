class Project {
    constructor(id, name, icon, type) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type;
    }

    toHTML() {
        const typeLabel = this.type === 'transducer'
            ? '<span class="badge bg-secondary mb-2">Transducer</span>'
            : '<span class="badge bg-primary mb-2">Acceptor</span>';

        return `
            <div class="col-md-4">
                <div class="card feature-card h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4 position-relative">

                        <div class="dropdown position-absolute top-0 end-0 m-2">
                            <button class="btn btn-sm btn-light border-0" type="button"
                                data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item text-danger" href="#"
                                       onclick="event.preventDefault(); ProjectManager.deleteProject(${this.id});">
                                        <i class="bi bi-trash me-2"></i>Delete Project
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div class="feature-icon mb-3">
                            <i class="bi ${this.icon}"></i>
                        </div>

                        ${typeLabel}
                        <h5 class="card-title">${this.name}</h5>

                        <button class="btn btn-outline-red btn-sm mt-2"
                                onclick="ProjectManager.openProject(${this.id})">
                            continue working
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

const ProjectManager = {

    projects: [],

    availableIcons: [
        'bi-speedometer2', 'bi-shield-check', 'bi-people',
        'bi-rocket', 'bi-lightbulb', 'bi-star',
        'bi-heart', 'bi-trophy', 'bi-graph-up',
        'bi-gear', 'bi-file-earmark', 'bi-code-slash'
    ],

    async init() {
        const container = document.querySelector('.features-section .row.g-4');
        if (container) container.style.transition = 'opacity 0.3s ease-in-out';

        this._injectModal();

        const user = API.getCurrentUser();
        if (!user) {
            this.render();
            return;
        }

        const data = await API.getProjects();
        this.projects = data.map(p => {
            const icon = this.availableIcons[p.id % this.availableIcons.length];
            return new Project(p.id, p.name, icon, p.type || 'acceptor');
        });
        this.render();
    },

    async createProject(name, type) {
        if (!name || !type) return;

        const user = API.getCurrentUser();
        if (!user) {
            alert("You need to be logged in to create projects.");
            return;
        }

        const icon = this.availableIcons[Math.floor(Math.random() * this.availableIcons.length)];
        const data = await API.createProject(name, type);

        if (data.error) {
            alert("Error creating project: " + data.error);
            return;
        }

        this.projects.push(new Project(data.id, name, icon, type));
        this.render();
    },

    async deleteProject(id) {
        await API.deleteProject(id);
        this.projects = this.projects.filter(p => p.id !== id);
        this.render();
    },

    getProject(id) {
        return this.projects.find(p => p.id === id) || null;
    },

    openProject(id) {
        const project = this.getProject(id);
        if (!project) return;

        // projectID und projectName speichern
        localStorage.setItem('currentProjectID', project.id);
        localStorage.setItem('currentProjectName', project.name);
        localStorage.setItem('currentProjectType', project.type);

        if (project.type === 'transducer') {
            window.location.href = '/pages/transducer.html';
        } else {
            window.location.href = '/pages/acceptor.html';
        }
    },

    promptNewProject() {
        const modal = new bootstrap.Modal(document.getElementById('newProjectModal'));
        document.getElementById('newProjectName').value = '';
        document.getElementById('newProjectType').value = 'acceptor';
        modal.show();
    },

    confirmNewProject() {
        const name = document.getElementById('newProjectName').value.trim();
        const type = document.getElementById('newProjectType').value;
        const finalName = name || `Project ${this.projects.length + 1}`;

        bootstrap.Modal.getInstance(document.getElementById('newProjectModal')).hide();
        this.createProject(finalName, type);
    },

    render() {
        const container = document.querySelector('.features-section .row.g-4');
        if (!container) return;

        container.style.opacity = '0';
        setTimeout(() => {
            if (this.projects.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted py-5">
                        <i class="bi bi-folder2-open fs-1"></i>
                        <p class="mt-2">No projects yet. Create one!</p>
                    </div>`;
            } else {
                container.innerHTML = this.projects.map(p => p.toHTML()).join('');
            }
            container.style.opacity = '1';
        }, 150);
    },

    _injectModal() {
        if (document.getElementById('newProjectModal')) return;
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div class="modal fade" id="newProjectModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>New Project</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Project name</label>
                            <input type="text" class="form-control" id="newProjectName" placeholder="My Automaton">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Type</label>
                            <select class="form-select" id="newProjectType">
                                <option value="acceptor">Acceptor</option>
                                <option value="transducer">Transducer</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-dark" onclick="ProjectManager.confirmNewProject()">
                            Create Project
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }
};

globalThis.ProjectManager = ProjectManager;

document.addEventListener('DOMContentLoaded', () => {
    ProjectManager.init();
});