window.onload = function(){
    

    setupAutomationsList();
}

function createAutomation(id, name){
    let automation = document.createElement("div");
    let automationRun = document.createElement("button");
    let automationName = document.createElement("input");
    let automationEdit = document.createElement("button");
    let automationDelete = document.createElement("button");

    automation.id = `${id}`;
    automationRun.innerText = "▶";
    automationName.value = name;
    automationEdit.innerText = "⚙";
    automationDelete.innerText = "x";

    automationRun.onclick = async () => {await eel.automation_execute(parseInt(automation.id))};
    automationName.onchange = async () => {await eel.automation_rename(parseInt(automation.id), automationName.value)};
    automationEdit.onclick = async () => {await editAutomation(parseInt(automation.id))};
    automationDelete.onclick = async () => {
        let anwser = confirm(`do you really want to delete "${automationName.value}"?`);
        if(!anwser){
            return;
        }

        let siblingAfter = automation.nextElementSibling;
        while(siblingAfter.id !== "new-automation"){
            siblingAfter.id = `${parseInt(siblingAfter.id) - 1}`;
            siblingAfter = siblingAfter.nextElementSibling;
        }

        automation.remove();
        let index = parseInt(automation.id);
        await eel.automation_delete(index);
    };

    automation.appendChild(automationRun);
    automation.appendChild(automationName);
    automation.appendChild(automationEdit);
    automation.appendChild(automationDelete);

    return automation;
}

async function setupAutomationsList(){
    let automations = await eel.automations_list_get()();

    let automationsList = document.getElementById("automations-list");
    let newAutomation = document.getElementById("new-automation");
    for(let automation of automationsList.children){
        if(automation !== newAutomation){
            automationsList.removeChild(automation);
        }
    }

    for(let i=0;i<automations.length;i++){
        automationsList.insertBefore(createAutomation(i, automations[i]), newAutomation);
    }
}


async function addAutomation(){
    let automationsList = document.getElementById("automations-list");
    let newAutomation = document.getElementById("new-automation");
    let index = automationsList.children.length - 1;
    let name = "new automation";
    automationsList.insertBefore(createAutomation(index, name), newAutomation);
    await eel.automation_create(index, name);
}


async function editAutomation(index){
    let automation = await eel.automation_get(index)();
    
    document.getElementById("automation-info-id").value = index;
    document.getElementById("automation-info-name").value = automation.name;
    for(let flag of automation.flags){
        try{
            let [id, value] = flag.split(":");
            document.getElementById(`automation-info-${id}`).value = value.trim();
        }catch{
            console.log("some feature might have not been implemented.");
        }
    }


    document.getElementById("start-record").disabled = false;
    document.getElementById("automation-info-cancel").disabled = false;
    document.getElementById("automation-info-save").disabled = false;
    document.getElementById("stop-record").disabled = true;

    document.getElementById("editing-automation").checked = true;
};


async function saveAutomation(){
    let index = parseInt(document.getElementById("automation-info-id").value);
    await eel.save_automation(index);
    
    console.log("saved");

    document.getElementById("editing-automation").checked = false;
}

function cancelAutomation(){
    document.getElementById("editing-automation").checked = false;
}


async function startRecord(){
    document.getElementById("start-record").disabled = true;
    document.getElementById("automation-info-cancel").disabled = true;
    document.getElementById("automation-info-save").disabled = true;
    document.getElementById("stop-record").disabled = false;

    await eel.record_start();
}


async function stopRecord(){
    let automationActions = await eel.record_stop()();

    let actionsList = document.getElementById("actions-list");
    for(let actionContent of automationActions){
        let action = document.createElement("div");
        action.innerText = actionContent;
        action.setAttribute("data-content", actionContent[0])
        actionsList.appendChild(action);
    }
    
    document.getElementById("start-record").disabled = true;
    document.getElementById("automation-info-cancel").disabled = false;
    document.getElementById("automation-info-save").disabled = false;
    document.getElementById("stop-record").disabled = true;
}
