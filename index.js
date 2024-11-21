window.onload = async () => {
    const tasks = await get_tasks();
    if (Array.isArray(tasks)) {
        tasks.forEach(task => display_task(task));

        // Check if the task completion status is saved in localStorage
        tasks.forEach(task => {
            const savedStatus = localStorage.getItem(`task-${task._id}-completed`);
            if (savedStatus === 'true') {
                const taskElement = document.querySelector(`#task-${task._id}`);
                if (taskElement) {
                    taskElement.style.textDecoration = 'line-through';
                }
            }
        });
    } else {
        console.error('Tasks is not an array:', tasks);
    }
};

async function get_tasks() {
    const response = await fetch('http://localhost:3000/api/v1/tasks');
    if (!response.ok) {
        console.error('Failed to fetch tasks:', response.statusText);
        return [];
    }
    const data = await response.json();
    return data.tasks || [];
}

const add_task = async () => {
    const task_name = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;

    if (task_name && description) {
        const task = {
            task_name,
            description,
            completed: false
        };

        const response = await fetch('http://localhost:3000/api/v1/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });

        if (response.ok) {
            const newTask = await response.json();
            display_task(newTask);
            clear_form();
        } else {
            console.error('Failed to add task:', response.statusText);
        }
    } else {
        alert("Please fill in both fields...");
    }
};

document.getElementById('add-task').addEventListener('click', add_task);

const display_task = (task) => {
    const tasksContainer = document.getElementById('tasks-container');
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.id = `task-${task._id}`;  // Set unique ID based on task ID
    taskElement.innerHTML = `
        <h3>${task.task_name}</h3>
        <p>${task.description}</p>
        <button class="complete-task">Complete</button>
        <button class="delete-task">Delete</button>
    `;
    tasksContainer.appendChild(taskElement);

    taskElement.querySelector('.complete-task').addEventListener('click', async () => {
        task.completed = !task.completed;

        const response = await fetch(`http://localhost:3000/api/v1/tasks/${task._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: task.completed })
        });

        if (response.ok) {
            const updatedTask = await response.json();
            if (updatedTask.specific_task.completed === true) {
                taskElement.style.textDecoration = 'line-through';
                // Save the completion status in localStorage
                localStorage.setItem(`task-${task._id}-completed`, 'true');
            } else {
                taskElement.style.textDecoration = 'none';  // Reset if not completed
                localStorage.removeItem(`task-${task._id}-completed`);
            }
        } else {
            console.error('Failed to update task status:', response.statusText);
        }
    });

    taskElement.querySelector('.delete-task').addEventListener('click', async () => {
        // Delete the task from the backend
        const response = await fetch(`http://localhost:3000/api/v1/tasks/${task._id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // Remove the task from the DOM
            tasksContainer.removeChild(taskElement);

            // Remove the task from localStorage if it exists
            localStorage.removeItem(`task-${task._id}-completed`);
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    });
};

const clear_form = () => {
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
};




        