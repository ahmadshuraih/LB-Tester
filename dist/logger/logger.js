"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
let logFile = "./src/logger/testlog.txt";
let totalPassedTests = 0;
let totalFailedTests = 0;
let totalErrors = 0;
let totalPassedTimeSpent = 0;
let totalFailedTimeSpent = 0;
let failedTestsDescriptions = [];
let errorsDescriptions = [];
/**
 * Returns `void`.
 *
 * Increase passed tests with 1 to know the total passed tests at the end.
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addPassedTest(timeSpent) {
    totalPassedTimeSpent += timeSpent;
    totalPassedTests += 1;
}
/**
 * Returns `void`.
 *
 * Increase failed tests with 1 and add the failure to know the total failed tests and the failures at the end.
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addFailedTest(fault, timeSpent) {
    totalFailedTimeSpent += timeSpent;
    totalFailedTests += 1;
    failedTestsDescriptions.push(fault);
}
/**
 * Returns `void`.
 *
 * Increase errors with 1 and add the error to know the total errors and the errors contexts at the end.
 */
function addError(error) {
    totalErrors += 1;
    errorsDescriptions.push(error);
}
/**
 * Returns `Promise<void>`.
 *
 * Write the tests result in the log file to see the results .
 */
function prepair() {
    const totalTests = totalPassedTests + totalFailedTests + totalErrors;
    const totalTimeSpent = totalPassedTimeSpent + totalFailedTimeSpent;
    const totalAverage = totalTimeSpent / totalTests | 0;
    const passedAverage = totalPassedTimeSpent / totalPassedTests | 0;
    const failedAverage = totalFailedTimeSpent / totalFailedTests | 0;
    let logText = `Total tests: ${totalTests}, total time spent: ${totalTimeSpent}ms, average time spent: ${totalAverage}ms\n`;
    logText += `Total passed tests: ${totalPassedTests}, total time spent: ${totalPassedTimeSpent}ms, average time spent: ${passedAverage}ms\n`;
    logText += `Total failed tests: ${totalFailedTests}, total time spent: ${totalFailedTimeSpent}ms, average time spent: ${failedAverage}ms\n`;
    logText += `Total errors: ${totalErrors}\n\n`;
    if (failedTestsDescriptions.length > 0) {
        logText += "Failures:\n";
    }
    for (const fault of failedTestsDescriptions) {
        logText += `${fault}\n\n`;
    }
    if (errorsDescriptions.length > 0) {
        logText += "Errors:\n";
    }
    for (const error of errorsDescriptions) {
        logText += `${error}\n\n`;
    }
    logText += `\nLog created at: ${new Date().toLocaleString()}\n`;
    fs_1.default.writeFileSync(logFile, logText);
}
/**
 * Returns `Promise<string>`.
 *
 * Read the latest tests results from the log file .
 */
function read() {
    return fs_1.default.readFileSync(logFile).toString();
}
/**
 * Returns `void`.
 *
 * Read the latest tests results from the log file and log it colored into the console.
 */
function log() {
    let logSection = "";
    const logFileContents = read();
    const contentsList = logFileContents.split('\n');
    console.log(chalk_1.default.blue(contentsList[0]));
    console.log(chalk_1.default.green(contentsList[1]));
    console.log(chalk_1.default.yellow(contentsList[2]));
    console.log(chalk_1.default.red(contentsList[3]));
    for (let i = 4; i < contentsList.length; i++) {
        if (contentsList[i].includes("Failures:")) {
            console.log(chalk_1.default.yellow(`\n\n${contentsList[i]}`));
            logSection = "Failures:";
        }
        else if (logSection === "Failures:" && !contentsList[i].includes("Errors:") && !contentsList[i].includes("Log created at:")) {
            console.log(chalk_1.default.yellow(contentsList[i]));
        }
        else if (contentsList[i].includes("Errors:")) {
            if (logSection === "Failures:")
                console.log(chalk_1.default.red(`\n${contentsList[i]}`));
            else
                console.log(chalk_1.default.red(`\n\n${contentsList[i]}`));
            logSection = "Errors:";
        }
        else if (logSection === "Errors:" && !contentsList[i].includes("Log created at:")) {
            console.log(chalk_1.default.red(contentsList[i]));
        }
        else if (contentsList[i].includes("Log created at:")) {
            if (logSection === "")
                console.log(chalk_1.default.white(`\n${contentsList[i]}`));
            else
                console.log(chalk_1.default.white(`${contentsList[i]}`));
        }
    }
}
/**
 * Returns `void`.
 *
 * Reset the results in the memory to start a new session.
 * To clear log file, use clear()
 */
function reset() {
    totalPassedTests = 0;
    totalFailedTests = 0;
    totalErrors = 0;
    totalPassedTimeSpent = 0;
    totalFailedTimeSpent = 0;
    failedTestsDescriptions = [];
    errorsDescriptions = [];
}
/**
 * Returns `Promise<void>`.
 *
 * Clear the contents of the log file.
 */
function clear() {
    fs_1.default.writeFileSync(logFile, '');
}
exports.default = {
    addPassedTest,
    addFailedTest,
    addError,
    prepair,
    read,
    log,
    reset,
    clear
};
