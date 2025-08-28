const newTaskInput = document.getElementById('newTaskInput');
const newTaskPriority = document.getElementById('newTaskPriority');
const newTaskDueDate = document.getElementById('newTaskDueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterAllBtn = document.getElementById('filterAll');
const filterActiveBtn = document.getElementById('filterActive');
const filterCompletedBtn = document.getElementById('filterCompleted');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const sortOptionsDropdown = document.getElementById('sortOptions');
const themeToggleButton = document.getElementById('themeToggleButton');

let tasks = [];
let currentFilter = 'all';
let currentSort = 'none';

const priorityOrder = {
    'low': 1,
    'medium': 2,
    'high': 3
};

/**
 * Generates a unique ID for a new task.
 * @returns {string} A unique ID.
 */
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    renderTasks(); 
}

/**
 * Sorts the given array of tasks based on the currentSort state.
 * @param {Array} tasksToSort - The array of tasks to sort.
 * @returns {Array} The sorted array of tasks.
 */
function sortTasks(tasksToSort) {
    console.log('--- Sorting Tasks ---');
    console.log('Tasks BEFORE sorting:', JSON.parse(JSON.stringify(tasksToSort))); 

    if (currentSort === 'priority-asc') {
        tasksToSort.sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    } else if (currentSort === 'priority-desc') {
        tasksToSort.sort((a, b) => {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    } else if (currentSort === 'date-early') {
        tasksToSort.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : null;
            const dateB = b.dueDate ? new Date(b.dueDate) : null;

            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; 
            if (!dateB) return -1; 

            return dateA.getTime() - dateB.getTime(); 
        });
    } else if (currentSort === 'date-late') {
        tasksToSort.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : null;
            const dateB = b.dueDate ? new Date(b.dueDate) : null;

            
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; 
            if (!dateB) return -1; 

            return dateB.getTime() - dateA.getTime(); 
        });
    }
    console.log('Tasks AFTER sorting:', tasksToSort);
    console.log('---------------------');
    return tasksToSort;
}

function renderTasks() {
    taskList.innerHTML = ''; 
        let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') {
            return !task.completed;
        } else if (currentFilter === 'completed') {
            return task.completed;
        }
        return true; 
    });

    filteredTasks = sortTasks(filteredTasks);

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} rounded-xl px-4 py-3 mb-2 transition-all duration-200 ease-in-out`;
        li.dataset.id = task.id; 

        li.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="mr-3 w-5 h-5 accent-indigo-500 cursor-pointer" ${task.completed ? 'checked' : ''}>
                <span class="task-text flex-grow">${task.text}</span>
                <div class="action-buttons">
                    <button class="edit-btn px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50">Edit</button>
                    <button class="delete-btn px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50">Delete</button>
                </div>
            </div>
            <div class="task-details hidden mt-2 pt-2 w-full">
                <div class="flex flex-col">
                    <label for="dueDate-${task.id}">Due Date:</label>
                    <input type="date" id="dueDate-${task.id}" value="${task.dueDate || ''}" class="rounded-md">
                </div>
                <div class="flex flex-col">
                    <label for="priority-${task.id}">Priority:</label>
                    <select id="priority-${task.id}" class="rounded-md">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="flex flex-col col-span-full">
                    <label for="notes-${task.id}">Notes:</label>
                    <textarea id="notes-${task.id}" rows="3" class="rounded-md">${task.notes || ''}</textarea>
                </div>
            </div>
        `;

        li.style.backgroundColor = 'var(--bg-task-item)';
        li.style.borderColor = 'var(--border-light)';

        const taskTextSpan = li.querySelector('.task-text');
        taskTextSpan.style.color = 'var(--text-primary)';
        if (task.completed) {
            taskTextSpan.style.textDecoration = 'line-through';
            taskTextSpan.style.color = 'var(--text-completed)';
        }

        li.querySelector('input[type="checkbox"]').style.accentColor = 'var(--accent-color)';

        const detailsDiv = li.querySelector('.task-details');
        detailsDiv.style.borderTopColor = 'var(--border-light)'; 
        detailsDiv.querySelectorAll('label').forEach(label => label.style.color = 'var(--text-secondary)');
        detailsDiv.querySelectorAll('input, select, textarea').forEach(el => {
            el.style.color = 'var(--text-primary)';
            el.style.backgroundColor = 'var(--bg-input)';
            el.style.borderColor = 'var(--border-medium)';
            if (task.completed) {
                el.style.color = 'var(--text-completed)';
            }
        });

        const editBtn = li.querySelector('.edit-btn');
        editBtn.style.backgroundColor = 'var(--green-button)';
        editBtn.style.color = 'white';
        editBtn.style.setProperty('--tw-ring-color', 'var(--green-button)');
        editBtn.style.setProperty('--tw-ring-opacity', '0.5');

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.style.backgroundColor = 'var(--orange-button)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.setProperty('--tw-ring-color', 'var(--red-button)');
        deleteBtn.style.setProperty('--tw-ring-opacity', '0.5');


        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        editBtn.addEventListener('click', () => editTask(task.id, editBtn));

        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        
        taskTextSpan.addEventListener('click', (event) => {
            if (!taskTextSpan.classList.contains('editable')) {
                detailsDiv.classList.toggle('hidden');
            }
        });

        const dueDateInput = li.querySelector(`#dueDate-${task.id}`);
        dueDateInput.addEventListener('change', (e) => updateTaskDetails(task.id, 'dueDate', e.target.value));

        const prioritySelect = li.querySelector(`#priority-${task.id}`);
        prioritySelect.addEventListener('change', (e) => updateTaskDetails(task.id, 'priority', e.target.value));

        const notesTextarea = li.querySelector(`#notes-${task.id}`);
        notesTextarea.addEventListener('input', (e) => updateTaskDetails(task.id, 'notes', e.target.value));

        taskList.appendChild(li);

       
        if (!li.classList.contains('initial-load')) { 
            li.classList.add('entering');
            li.addEventListener('animationend', () => {
                li.classList.remove('entering');
            }, { once: true });
        }
    });
}


function addTask() {
    const taskText = newTaskInput.value.trim();
    const priority = newTaskPriority.value;
    const dueDate = newTaskDueDate.value;

    if (taskText === '') {
        console.log('Task cannot be empty!');
        return;
    }

    const newTask = {
        id: generateUniqueId(),
        text: taskText,
        completed: false,
        dueDate: dueDate,
        priority: priority, 
        notes: ''
    };

    tasks.push(newTask);
    newTaskInput.value = '';
    newTaskPriority.value = 'medium';
    newTaskDueDate.value = '';
    saveTasks();
    renderTasks();
}

/**
 * Toggles the completion status of a task.
 * @param {string} id - The ID of the task to toggle.
 */
function toggleComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

/**
 * Enables editing for a task's text and details.
 * @param {string} id - The ID of the task to edit.
 * @param {HTMLElement} editButton - The edit button element.
 */
function editTask(id, editButton) {
    const taskItem = document.querySelector(`li[data-id="${id}"]`);
    const taskTextSpan = taskItem.querySelector('.task-text');
    const detailsDiv = taskItem.querySelector('.task-details');

    if (taskTextSpan.classList.contains('editable')) {
        taskTextSpan.contentEditable = 'false';
        taskTextSpan.classList.remove('editable');
        editButton.textContent = 'Edit';
        editButton.style.backgroundColor = 'var(--green-button)'; 
        editButton.style.setProperty('--tw-ring-color', 'var(--green-button)');

        
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].text = taskTextSpan.textContent.trim();
            saveTasks();
        }
        detailsDiv.classList.add('hidden'); 
    } else { 
        taskTextSpan.contentEditable = 'true';
        taskTextSpan.classList.add('editable');
        taskTextSpan.focus(); 
        editButton.textContent = 'Save';
        editButton.style.backgroundColor = 'var(--blue-button)'; 
        editButton.style.setProperty('--tw-ring-color', 'var(--blue-button)');
        detailsDiv.classList.remove('hidden'); 
    }
}

/**
 * Updates a specific detail (due date, priority, notes) of a task.
 * @param {string} id - The ID of the task to update.
 * @param {string} field - The field to update ('dueDate', 'priority', 'notes').
 * @param {string} value - The new value for the field.
 */
function updateTaskDetails(id, field, value) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex][field] = value;
        saveTasks();
    }
}

/**
 * Deletes a task from the tasks array.
 * @param {string} id - The ID of the task to delete.
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

/**
 * Sets the current filter and re-renders tasks.
 * @param {string} filterType - The type of filter ('all', 'active', 'completed').
 */
function setFilter(filterType) {
    console.log('Setting filter to:', filterType);
    currentFilter = filterType;
    // Update active state of filter buttons
    filterAllBtn.classList.remove('active');
    filterActiveBtn.classList.remove('active');
    filterCompletedBtn.classList.remove('active');

    if (filterType === 'all') {
        filterAllBtn.classList.add('active');
    } else if (filterType === 'active') {
        filterActiveBtn.classList.add('active');
    } else if (filterType === 'completed') {
        filterCompletedBtn.classList.add('active');
    }
    renderTasks();
    console.log('Tasks after filtering and rendering:', tasks);
}

/**
 * Sets the current sort order and re-renders tasks.
 * @param {string} sortType - The type of sort ('none', 'priority-asc', 'priority-desc', 'date-early', 'date-late').
 */
function setSort(sortType) {
    console.log('Setting sort to:', sortType);
    currentSort = sortType;
    renderTasks(); 
    console.log('Tasks after sorting and rendering:', tasks);
}


function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeToggleButton(isDarkMode);
}

/**
 * Updates the theme toggle button's icon.
 * @param {boolean} isDarkMode - True if currently in dark mode, false otherwise.
 */
function updateThemeToggleButton(isDarkMode) {
    const icon = themeToggleButton.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}


function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        updateThemeToggleButton(true);
    } else {
        updateThemeToggleButton(false);
    }
}


function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}


addTaskBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterAllBtn.addEventListener('click', () => setFilter('all'));
filterActiveBtn.addEventListener('click', () => setFilter('active'));
filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
clearCompletedBtn.addEventListener('click', clearCompletedTasks);

sortOptionsDropdown.addEventListener('change', (event) => {
    setSort(event.target.value);
});

themeToggleButton.addEventListener('click', toggleTheme); 


document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme(); 
    loadTasks();
});
