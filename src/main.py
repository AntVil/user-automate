import keyboard
import mouse
import eel
import os


ACTIONS_FOLDER = os.path.join(os.path.dirname(__file__), "actions")
INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), "interface")





@eel.expose
def get_actions_list():
    actions = []
    for file in os.listdir(ACTIONS_FOLDER):
        with open(os.path.join(ACTIONS_FOLDER, file), "r") as f:
            name = f.readline()
        actions.append(name)
    return actions


@eel.expose
def action_execute(index):
    pass


@eel.expose
def action_rename(index, name):
    with open(os.path.join(ACTIONS_FOLDER, f"{index}.txt"), "r") as f:
        lines = f.readlines()
    lines[0] = f"{name}\n"
    with open(os.path.join(ACTIONS_FOLDER, f"{index}.txt"), "w") as f:
        f.writelines(lines)


@eel.expose
def action_delete(index):
    os.remove(os.path.join(ACTIONS_FOLDER, f"{index}.txt"))
    for file in sorted(os.listdir(ACTIONS_FOLDER))[index:]:
        i = int(file.split(".")[0]) - 1
        os.rename(os.path.join(ACTIONS_FOLDER, file), os.path.join(ACTIONS_FOLDER, f"{i}.txt"))


@eel.expose
def action_create(index, name):
    with open(os.path.join(ACTIONS_FOLDER, f"{index}.txt"), "w") as f:
        f.write(f"{name}\n")


eel.init(INTERFACE_FOLDER)
eel.start("index.html")
