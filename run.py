#!/usr/bin/env python3

import os
import datetime
import sys
import subprocess

def error_check_menu_number(select, options_list):
    try:
        selected = int(select)
        if len(options_list) >= selected:
            return selected
        print(str(select) + " is not in the list to be selected")
    except ValueError:
        print(select + " is not a number")
    return None

def get_possible_commands():
    return [""] + list(local.keys())

def get_passed_arguments():
    if len(sys.argv) > 1:
        arguments = sys.argv[1:]
        if arguments[0] not in options:
            print(arguments[0] + " is not an option!")
            sys.exit(1)
        return arguments

def make_user_select_from_menu():
    for c, option in enumerate(options):
        if option == "":
            continue
        print(str(c) + ") " + translations[option] + " (" + option + ")")
    print("Select operation: ")
    selection = error_check_menu_number(input(), options)
    return selection

local = {
    "build_backend": 'docker build -f backend/build/Dockerfile -t koppi:latest .',
    "run_backend": 'docker-compose up'
}

translations = {
    "build_backend": "Build backend",
    "run_backend": "Run backend"
}

options = get_possible_commands()
arguments = get_passed_arguments()


keyboardinterrupt = False

if arguments:
    command_name = arguments[0]
    selection = command_name
else:
    try:
        number = make_user_select_from_menu()
        selection = options[number]
    except KeyboardInterrupt:
        selection = None
        keyboardinterrupt = True


if selection:
    print("%s - Executing %s -command", datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), selection)

    executable="/bin/sh"

    response = subprocess.run(
        local[selection],
        shell=True,
        cwd=os.getcwd(),
        executable=executable
        )
    try:
        response.check_returncode()
        print(
            "%s - Process %s was successful.",
            datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            selection
        )

    except Exception as err:
        print(
            "%s - Process %s failed! Error: %s",
            datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            selection,
            err
            )
