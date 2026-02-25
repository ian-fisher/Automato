class Project {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.createdAt = new Date();
    }

    toHTML() {
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
    nextId: 1,

    availableIcons: [
        'bi-speedometer2', 'bi-shield-check', 'bi-people',
        'bi-rocket', 'bi-lightbulb', 'bi-star',
        'bi-heart', 'bi-trophy', 'bi-graph-up',
        'bi-gear', 'bi-file-earmark', 'bi-code-slash'
    ],

    init() {
        this.createProject('Project 1', 'bi-speedometer2');
        this.createProject('Project 2', 'bi-shield-check');
        this.createProject('Project 3', 'bi-people');

        const container = document.querySelector('.features-section .row.g-4');
        if (container) {
            container.style.transition = 'opacity 0.3s ease-in-out';
        }

        this.render();
    },

    createProject(name, icon) {
        if (!name || !icon) return;

        const project = new Project(this.nextId++, name, icon);
        this.projects.push(project);

        this.render();
        return project;
    },

    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.projects.splice(index, 1);
        this.render();
        return true;
    },

    getProject(id) {
        return this.projects.find(p => p.id === id) || null;
    },

    openProject(id) {
        const project = this.getProject(id);
        if (!project) return;

        alert(`Opening ${project.name}...`);
    },

    promptNewProject() {
        const projectName = prompt(
            'Enter project name:',
            `Project ${this.nextId}`
        );

        if (projectName === null) return;

        const finalName = projectName.trim() || `Project ${this.nextId}`;
        const randomIcon =
            this.availableIcons[
                Math.floor(Math.random() * this.availableIcons.length)
            ];

        this.createProject(finalName, randomIcon);
    },

    render() {
        const container = document.querySelector('.features-section .row.g-4');
        if (!container) return;

        container.style.opacity = '0';

        setTimeout(() => {
            container.innerHTML =
                this.projects.map(p => p.toHTML()).join('');
            container.style.opacity = '1';
        }, 150);
    }
};

/* expose to inline HTML handlers */
globalThis.ProjectManager = ProjectManager;

document.addEventListener('DOMContentLoaded', () => {
    ProjectManager.init();
});