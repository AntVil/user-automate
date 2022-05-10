from pynput import keyboard
from pynput import mouse
import eel
import os
import datetime


AUTOMATIONS_FOLDER = os.path.join(os.path.dirname(__file__), "automations")
INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), "interface")





#mouse.on_click(record_click)

@eel.expose
def automations_list_get():
    automations = []
    for file in os.listdir(AUTOMATIONS_FOLDER):
        with open(os.path.join(AUTOMATIONS_FOLDER, file), "r") as f:
            name = f.readline()
        automations.append(name)
    return automations


@eel.expose
def automation_execute(index):
    pass


@eel.expose
def automation_rename(index, name):
    with open(os.path.join(AUTOMATIONS_FOLDER, f"{index}.txt"), "r") as f:
        lines = f.readlines()
    lines[0] = f"{name}\n"
    with open(os.path.join(AUTOMATIONS_FOLDER, f"{index}.txt"), "w") as f:
        f.writelines(lines)


@eel.expose
def automation_delete(index):
    os.remove(os.path.join(AUTOMATIONS_FOLDER, f"{index}.txt"))
    for file in sorted(os.listdir(AUTOMATIONS_FOLDER))[index:]:
        i = int(file.split(".")[0]) - 1
        os.rename(os.path.join(AUTOMATIONS_FOLDER, file), os.path.join(AUTOMATIONS_FOLDER, f"{i}.txt"))


@eel.expose
def automation_create(index, name):
    with open(os.path.join(AUTOMATIONS_FOLDER, f"{index}.txt"), "w") as f:
        f.write(f"{name}\n")


@eel.expose
def automation_get(index):
    with open(os.path.join(AUTOMATIONS_FOLDER, f"{index}.txt"), "r") as f:
        lines = f.readlines()
    
    name = lines[0].strip()
    flags = []
    actions = []
    for line in lines[1:]:
        if line.startswith("-"):
            flags.append(line[1:].strip())
        else:
            actions.append(line.strip())
    
    return {
        "name": name,
        "flags": flags,
        "actions": actions
    }


@eel.expose
def automation_save(index):
    pass




recording = []
recording_start = datetime.datetime.now()

def record_mousemove(x, y):
    if len(recording) > 0 and recording[-1][0] == "move":
        recording[-1][1].append([x, y, datetime.datetime.now()])
    else:
        recording.append(("move", [[x, y, datetime.datetime.now()]]))


def record_click(x, y, button, is_press):
    if is_press:
        recording.append(["click", button.name, datetime.datetime.now()])


def record_keypress(char):
    if len(recording) > 0 and recording[-1][0] == "press" and recording[-1][1] == char:
        return
    recording.append(["press", str(char).lower(), datetime.datetime.now()])


def record_keyrelease(char):
    if len(recording) > 0 and recording[-1][0] == "release" and recording[-1][1] == char:
        return
    recording.append(["release", str(char).lower(), datetime.datetime.now()])


@eel.expose
def record_start():
    global mouse_listener
    global keyboard_listener
    global recording
    global recording_start
    recording = []
    mouse_listener = mouse.Listener(record_mousemove, record_click)
    keyboard_listener = keyboard.Listener(record_keypress, record_keyrelease)
    recording_start = datetime.datetime.now()
    mouse_listener.start()
    keyboard_listener.start()
    

@eel.expose
def record_stop():
    global mouse_listener
    global keyboard_listener
    global recording
    global recording_start
    mouse_listener.stop()
    keyboard_listener.stop()

    dt = recording_start
    for action in recording:
        if action[0] == "move":
            for move in action[1]:
                dt_ = move[2]
                move[2] = (move[2] - dt).total_seconds()
                dt = dt_
        else:
            dt_ = action[2]
            action[2] = (action[2] - dt).total_seconds()
            dt = dt_
    return recording
        


eel.init(INTERFACE_FOLDER)
eel.start("index.html")
