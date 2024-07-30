import * as readline from "node:readline/promises";
import { stdin as input, stdout as output, argv } from "node:process";
import moment from "moment";
import path from "node:path";
import fs from "fs";
import ValidCommands from "./valid-commands.js";

const ALARMS_FILE = path.resolve("alarms.json");
const ALARM_SOUND = path.resolve("alarm.wav");

// template class to create new alarms
class Alarm {
  constructor(minute, hour, weekday) {
    this.minute = parseInt(minute);
    this.hour = parseInt(hour);
    this.weekday = weekday;
    this.snoozeCount = 0;
  }
}

// main AlarmClock class to handle all the alarm related operations
class AlarmClock {
  constructor() {
    this.alarms = this.loadAlarms();
  }
  static validWeekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  static showCurrentTime() {
    setInterval(() => {
      output.write(
        `Current Time: ${moment().format("DD MMM YYYY HH:mm:ss")}\r`
      );
    }, 1000);
  }

  async createNewAlarm() {
    const rl = readline.createInterface({ input, output });

    const weekday = await this.promptValidated(
      rl,
      "Enter weekday (e.g., Monday): ",
      (input) => AlarmClock.validWeekDays.includes(input)
    );

    const hour = await this.promptValidated(
      rl,
      "Enter hour (0-23): ",
      (input) =>
        Number.isInteger(Number(input)) &&
        Number(input) >= 0 &&
        Number(input) <= 23
    );

    const minute = await this.promptValidated(
      rl,
      "Enter minute (0-59): ",
      (input) =>
        Number.isInteger(Number(input)) &&
        Number(input) >= 0 &&
        Number(input) <= 59
    );

    const alarm = new Alarm(minute, hour, weekday);

    if (this.isAlarmExists(alarm)) {
      console.error("Alarm already exists!");
      return rl.close();
    }
    this.syncAlarms([...this.alarms, alarm]);
    rl.close();
  }

  isAlarmExists(alarm) {
    return this.alarms.some((alrm) => {
      return (
        alrm.weekday === alarm.weekday &&
        alrm.hour === alarm.hour &&
        alrm.minute === alarm.minute
      );
    });
  }

  syncAlarms(alarms) {
    this.alarms = alarms;
    fs.writeFileSync(ALARMS_FILE, JSON.stringify(alarms));
  }

  async promptValidated(rl, question, validator) {
    let input;
    let isValid = false;

    while (!isValid) {
      input = await rl.question(question);
      isValid = validator(input);
      if (!isValid) {
        console.log("Invalid input. Please try again.");
      }
    }

    return input;
  }

  loadAlarms() {
    const alarmsFile = fs.readFileSync(ALARMS_FILE);
    const alarms = JSON.parse(alarmsFile);
    return alarms;
  }

  listAlarms() {
    console.log(`id weekday time`);
    this.alarms.forEach((alarm, index) => {
      let time = moment().hours(alarm.hour).minutes(alarm.minute);
      let formattedTime = time.format("HH:mm");
      console.log(`${index + 1} ${alarm.weekday} ${formattedTime}`);
    });
  }

  async deleteAlarm() {
    const rl = readline.createInterface({ input, output });
    const questionId = await rl.question(`Enter question id`);
    this.alarms.filter((alm, index) => index !== questionId);
    this.syncAlarms(this.alarms);
  }

  snoozeAlarm() {}

  ringAlarmBell() {}

  checkForAlarms() {
    setInterval(() => {
      const currentMinute = moment().get("minute");
      const currentHour = moment().get("hour");
      const currentWeekday = AlarmClock.validWeekDays[moment().get("day")];
    }, 60 * 1000);
  }
}

// main function which processes all the commands given in cli
function main() {
  const inputArg = argv.slice(2);
  const alarmClock = new AlarmClock();
  const validCommands = ValidCommands.commands;
  switch (inputArg[0]) {
    case validCommands.SHOW_TIME.command:
      AlarmClock.showCurrentTime();
      break;
    case validCommands.SET_ALARM.command:
      alarmClock.createNewAlarm();
      break;
    case validCommands.LIST.command:
      alarmClock.listAlarms();
      break;
    case validCommands.DELETE.command:
      alarmClock.deleteAlarm();
      break;
    case validCommands.HELP.command:
      ValidCommands.listValidCommands();
      break;

    default:
      console.error("Invalid command use --help for all valid commands");
      break;
  }
}

main();
