window.onload = function () {
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    
    const btn = document.getElementById("btn");
    const btnAll = document.getElementById('btn-all')
    const btnTodo = document.getElementById('btn-todo')
    const btnDone = document.getElementById('btn-done')
    const list = document.getElementById("list");
  
    //"todo" albo "done" jeżeli chcemy filtorwać 
    let selectTasks ="all";

    function getTasks()
    {
        //wyczysczenie listy zadań
        list.innerHTML="";
        fetch("http://localhost:3000/api/tasks")
        .then(tasks => tasks.json())
        .then(tasks => {
        
            switch (selectTasks) {
                case "todo":
                     tasks = tasks.filter(task => task.isDone === false)
                    break;
                case "done":
                    tasks = tasks.filter(task => task.isDone)
                    break;
            }

            tasks.forEach(createTaskElement);
            addActionToButtons();
        });
   }

    function createTaskElement(task){

        const liElement=document.createElement("li");
        console.log(task);
        
        //ask for tags
        fetch(`http://localhost:3000/api/tasks/${task._id}/tags`)
        .then(res =>res.json())
        .then(res => {
            //jeżeli są tagi
            if(res.length >0){
               for(let i = 0; i <= res.length; i++){
                   if(res[i])
                    liElement.appendChild(createTag(res[i]));
               }
            }
        });
        
        liElement.dataset.id=task._id;
        liElement.innerText=task.name;
        
        

        let deleteButton = document.createElement("button");
        deleteButton.classList="btn btn-outline-danger action-button delete-task";
        deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        
        let checkButton = document.createElement("button");
        checkButton.classList = "btn btn-outline-success action-button check-task";
        checkButton.innerHTML = `<i class="fas fa-check"></i>`;

        let undoButton = document.createElement("button");
        undoButton.classList = "btn btn-outline-primary action-button undo-task";
        undoButton.innerHTML = `<i class="fas fa-undo-alt"></i>`;

        liElement.appendChild(deleteButton);
        if(task.isDone === false){
            liElement.appendChild(checkButton);
            
        }
        
        if(task.isDone){
            liElement.appendChild(undoButton);
            liElement.className="done";
        }
        list.appendChild(liElement);

    }

    function createTag(tag)
    {
        if(tag)
        {
            const tagElement = document.createElement("span");
            tagElement.innerHTML = tag.name;
            tagElement.style.backgroundColor = tag.color;
            tagElement.className = "badge badge-pill "
            return tagElement;
        }
       
    }
  
    function addActionToButtons() {
        for (let button of document.getElementsByClassName("delete-task"))
            button.addEventListener("click", (e)=>{
                e.preventDefault();
                e.stopPropagation();
                console.log(e);
            })
        
     
    }
    btn.addEventListener('click', addToDoItem);
    list.addEventListener("click", listenToElementChanges);
    btnDone.addEventListener("click", filterByDone);
    btnTodo.addEventListener('click', filterNotDone)
    btnAll.addEventListener('click', displayAll)

    function filterByDone() {
        btnAll.className = "btn btn-sm btn-dark";
        btnTodo.className = "btn btn-sm btn-dark";
        btnDone.className = "btn btn-sm btn-primary active";
        selectTasks = "done";
        getTasks();
    }
    function filterNotDone() {
        btnAll.className = "btn btn-sm btn-dark";
        btnTodo.className = "btn btn-sm btn-primary active";
        btnDone.className = "btn btn-sm btn-dark ";
        selectTasks = "todo";
        getTasks();
    }



    function displayAll(e) {
        btnAll.className = "btn btn-sm btn-primary active";
        btnTodo.className = "btn btn-sm btn-dark";
        btnDone.className = "btn btn-sm btn-dark ";
        selectTasks = "all";
        getTasks();
    }

    function addToDoItem(e) {
        e.preventDefault()
        if (input.value.length <= 3) {
            alert('Zadanie musi mieć minimum 3 znaki')
        } else {
            addNewTask();
        }
    }

    function addNewTask(){
        fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                name: input.value,
                isDone: false,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(task => {
            if (list.style.borderTop === "") {
                list.style.borderTop = "2px solid white";
            }
            const item = createItem(task._id, task.name, task.isDone);

            list.insertAdjacentHTML('beforeend', item);
            id++;
            form.reset();
            allTasks.push(task)
        })

    }

    function listenToElementChanges(event) {
        const element = event.target;
        if (element.type === "checkbox") {
            if (element.checked) {
                console.log('if')
                element.parentNode.style.textDecoration = "line-through"

            } else {
                console.log('else')
                element.parentNode.style.textDecoration = "none"
            }
            fetch(`http://localhost:3000/api/tasks/${element.parentNode.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: element.parentNode.innerText,
                    isDone: element.checked,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(res => allTasks = allTasks.map(el => el._id === res._id ? res : el))

        }

        if (element.type === "button") {
            fetch(`http://localhost:3000/api/tasks/${element.parentNode.id}`, {
                method: 'DELETE',
            }).then(res => res.json()).then(res => {
                const child = document.getElementById(res._id);
                list.removeChild(child)
            })
        }

    }

    //DODANIE ZADANIA PO NACIŚNIĘCIU ENTERA
    input.addEventListener("keyup", (e) => {
        e.preventDefault();
         if (event.keyCode === 13) {
             addNewTask();
         }
            
    })

    getTasks();

}