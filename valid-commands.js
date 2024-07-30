// Class which holds all valid commands
class ValidCommands {
  static commands = Object.freeze({
    SHOW_TIME: {
      command: "show-time",
      description: "Shows current time in DD MMM YYYY HH:mm:ss ",
    },
    SET_ALARM: {
      command: "set-alarm",
      description: "Sets an alarm for given time",
    },
    LIST: {
      command: "list",
      description: "Lists all the alarms",
    },
    DELETE: {
      command: "delete",
      description: "Deletes alarm for given id",
    },
    HELP: {
      command: "--help",
      description: "Shows all available commands",
    },
  });

  //   list all the valid commands available
  static listValidCommands() {
    for (const key in ValidCommands.commands) {
      console.log(
        `${ValidCommands.commands[key].command} ------> ${ValidCommands.commands[key].description}`
      );
    }
  }
}

export default ValidCommands;
