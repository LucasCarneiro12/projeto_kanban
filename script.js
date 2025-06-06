document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('newTaskForm');
    const todoColumn = document.getElementById('todo-column').querySelector('.tasks-container');
    const inprogressColumn = document.getElementById('inprogress-column').querySelector('.tasks-container');
    const doneColumn = document.getElementById('done-column').querySelector('.tasks-container');
    const columns = document.querySelectorAll('.kanban-column .tasks-container'); // Seleciona os contêineres de tarefas

    const confirmDeleteModalElement = document.getElementById('confirmDeleteModal');
    const confirmDeleteModal = new bootstrap.Modal(confirmDeleteModalElement); // Instância do Modal Bootstrap
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const taskNameToDeleteElement = document.getElementById('taskNameToDelete'); // Para mostrar nome da tarefa

    let taskToDeleteId = null; // Variável para guardar o ID da tarefa a ser excluída

   


    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Carrega tarefas do localStorage ou inicia array vazio
    let draggedTask = null;



    // Função para renderizar tarefas nas colunas
    function renderTasks() {
        // Limpa as colunas antes de renderizar
        todoColumn.innerHTML = '';
        inprogressColumn.innerHTML = '';
        doneColumn.innerHTML = '';

        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            if (task.status === "A fazer") {
                todoColumn.appendChild(taskCard);
            } else if (task.status === "Em andamento") {
                inprogressColumn.appendChild(taskCard);
            } else if (task.status === "Concluído") {
                doneColumn.appendChild(taskCard);
            }
        });
        addDragAndDropListeners(); // Adiciona listeners após renderizar
    }


    





    // Função para criar o HTML de um card de tarefa
    // Função para criar o HTML de um card de tarefa (MODIFICADA)
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.classList.add('task-card');
        // Adicione classes do Bootstrap ao card se quiser, ex: card.classList.add('card', 'mb-3');
        card.setAttribute('draggable', true);
        card.dataset.taskId = task.id;

        card.innerHTML = `
            <h3>${task.name}</h3>
            <p>${task.description}</p>
            <button class="delete-btn btn btn-sm btn-outline-danger float-end">Excluir</button> `;

        // Event listener para o botão de excluir (MODIFICADO)
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            taskToDeleteId = task.id; // Guarda o ID da tarefa
            taskNameToDeleteElement.textContent = `Tarefa: ${task.name}`; // Mostra o nome da tarefa no modal
            confirmDeleteModal.show(); // Mostra o modal de confirmação
        });

        return card;
    }




    // Função para adicionar uma nova tarefa
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = document.getElementById('taskName').value;
        const taskDescription = document.getElementById('taskDescription').value;

        if (taskName.trim() === '') {
            alert("O nome da tarefa não pode estar vazio!");
            return;
        }

        const newTask = {
            id: Date.now().toString(), // ID único simples
            name: taskName,
            description: taskDescription,
            status: "A fazer" // Status inicial
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset(); // Limpa o formulário
    });

    // Função para deletar uma tarefa
    function performTaskDeletion(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

     // Event listener para o botão de confirmação de exclusão no modal
    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDeleteId) {
            performTaskDeletion(taskToDeleteId);
        }
        confirmDeleteModal.hide(); // Esconde o modal após a ação
    });

    // Função para salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Funcionalidades de Arrastar e Soltar
    function addDragAndDropListeners() {
        const taskCards = document.querySelectorAll('.task-card');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedTask = card;
                setTimeout(() => { // Dá um tempo para o navegador "pegar" o item
                    card.classList.add('dragging');
                }, 0);
                e.dataTransfer.setData('text/plain', card.dataset.taskId); 
            });

            card.addEventListener('dragend', () => {
                draggedTask.classList.remove('dragging');
                draggedTask = null;
            });
        });

        columns.forEach(columnContainer => {
            columnContainer.addEventListener('dragover', (e) => {
                e.preventDefault(); // Permite o drop
                columnContainer.parentElement.classList.add('drag-over'); // Feedback visual na coluna
            });

            columnContainer.addEventListener('dragleave', () => {
                columnContainer.parentElement.classList.remove('drag-over');
            });

            columnContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                columnContainer.parentElement.classList.remove('drag-over');
                if (draggedTask) {
                    const targetColumnElement = columnContainer.closest('.kanban-column');
                    const newStatus = targetColumnElement.dataset.status;
                    const taskId = draggedTask.dataset.taskId;

                    // Atualiza o status da tarefa no array 'tasks'
                    const taskToUpdate = tasks.find(task => task.id === taskId);
                    if (taskToUpdate) {
                        taskToUpdate.status = newStatus;
                        saveTasks();
                        renderTasks(); // Re-renderiza para mover o card
                    }
                }
            });
        });
    }

    // ---- API  ----
    async function fetchProductivityQuote() {
        const extraContentDiv = document.getElementById('extra-content');
        try {
            const response = await fetch('https://api.quotable.io/random?tags=productivity|motivation');
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();
            extraContentDiv.innerHTML = `<p>"${data.content}" - <em>${data.author}</em></p>`;
        } catch (error) {
            console.error("Erro ao buscar frase:", error);
            extraContentDiv.innerHTML = "<p>Não foi possível carregar uma frase no momento.</p>";
        }
    }

   


    // Inicialização
    renderTasks(); // Renderiza tarefas ao carregar a página
    fetchProductivityQuote(); // Busca uma frase ao carregar
    // fetchProductivityGif(); // Descomente e configure se quiser usar GIFs
});