window.onload = function(){
    

    setupActionsList();
}

function createAction(id, name){
    let action = document.createElement("div");
    let actionRun = document.createElement("button");
    let actionName = document.createElement("input");
    let actionEdit = document.createElement("button");
    let actionDelete = document.createElement("button");

    action.id = `${id}`;
    actionRun.innerText = "▶";
    actionName.value = name;
    actionEdit.innerText = "⚙";
    actionDelete.innerText = "x";

    actionRun.onclick = async () => {await eel.action_execute(parseInt(action.id))};
    actionName.onchange = async () => {await eel.action_rename(parseInt(action.id), actionName.value)};
    actionEdit.onclick = () => console.log("edit");
    actionDelete.onclick = async () => {
        let siblingAfter = action.nextElementSibling;
        while(siblingAfter.id !== "new-action"){
            siblingAfter.id = `${parseInt(siblingAfter.id) - 1}`;
            siblingAfter = siblingAfter.nextElementSibling;
        }

        action.remove();
        let index = parseInt(action.id);
        await eel.action_delete(index);
    };

    action.appendChild(actionRun);
    action.appendChild(actionName);
    action.appendChild(actionEdit);
    action.appendChild(actionDelete);

    return action;
}

async function setupActionsList(){
    let actions = await eel.get_actions_list()();

    let actionsList = document.getElementById("actions-list");
    let newAction = document.getElementById("new-action");
    for(let action of actionsList.children){
        if(action !== newAction){
            actionsList.removeChild(action);
        }
    }

    for(let i=0;i<actions.length;i++){
        actionsList.insertBefore(createAction(i, actions[i]), newAction);
    }
}


async function addAction(){
    let actionsList = document.getElementById("actions-list");
    let newAction = document.getElementById("new-action");
    let index = actionsList.children.length - 1;
    let name = "new action";
    actionsList.insertBefore(createAction(index, name), newAction);
    await eel.action_create(index, name);
}
