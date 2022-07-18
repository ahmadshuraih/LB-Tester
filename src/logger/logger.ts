import fs from 'fs';
import chalk from 'chalk';

let logFile = "./src/logger/testlog.txt";
let totalPassedTests: number = 0;
let totalFailedTests: number = 0;
let totalErrors: number = 0;
let totalPassedTimeSpent: number = 0;
let totalFailedTimeSpent: number = 0;
let failedTestsDescriptions: string[] = [];
let errorsDescriptions: string[] = [];

/**
 * Returns `void`.
 *
 * Increase passed tests with 1 to know the total passed tests at the end.
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addPassedTest(timeSpent: number): void {
    totalPassedTimeSpent += timeSpent;
    totalPassedTests += 1;
}

/**
 * Returns `void`.
 *
 * Increase failed tests with 1 and add the failure to know the total failed tests and the failures at the end.
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addFailedTest(fault: string, timeSpent: number): void {
    totalFailedTimeSpent += timeSpent;
    totalFailedTests += 1;
    failedTestsDescriptions.push(fault);
}

/**
 * Returns `void`.
 *
 * Increase errors with 1 and add the error to know the total errors and the errors contexts at the end.
 */
 function addError(error: string): void {
    totalErrors += 1;
    errorsDescriptions.push(error);
}

/**
 * Returns `Promise<void>`.
 *
 * Write the tests result in the log file to see the results .
 */
function prepair(): void {
    const totalTests = totalPassedTests + totalFailedTests + totalErrors;
    const totalTimeSpent = totalPassedTimeSpent + totalFailedTimeSpent;
    const totalAverage = totalTimeSpent / totalTests | 0;
    const passedAverage = totalPassedTimeSpent / totalPassedTests | 0;
    const failedAverage = totalFailedTimeSpent / totalFailedTests | 0;

    let logText = `Total tests: ${totalTests}, total time spent: ${totalTimeSpent}ms, average time spent: ${totalAverage}ms\n`;
    logText += `Total passed tests: ${totalPassedTests}, total time spent: ${totalPassedTimeSpent}ms, average time spent: ${passedAverage}ms\n`;
    logText += `Total failed tests: ${totalFailedTests}, total time spent: ${totalFailedTimeSpent}ms, average time spent: ${failedAverage}ms\n`;
    logText += `Total errors: ${totalErrors}\n\n`

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

    fs.writeFileSync(logFile, logText);
}

/**
 * Returns `Promise<string>`.
 *
 * Read the latest tests results from the log file .
 */
function read(): string {
    return fs.readFileSync(logFile).toString();
}

/**
 * Returns `void`.
 *
 * Read the latest tests results from the log file and log it colored into the console.
 */
function log(): void {
    let logSection = "";
    const logFileContents = read();
    const contentsList = logFileContents.split('\n');
    console.log(chalk.blue(contentsList[0]));
    console.log(chalk.green(contentsList[1]));
    console.log(chalk.yellow(contentsList[2]));
    console.log(chalk.red(contentsList[3]));
    
    for (let i = 4; i < contentsList.length; i++) {
        if (contentsList[i].includes("Failures:")) {
            console.log(chalk.yellow(`\n\n${contentsList[i]}`));
            logSection = "Failures:";
        } else if (logSection === "Failures:" && !contentsList[i].includes("Errors:") && !contentsList[i].includes("Log created at:")) {
            console.log(chalk.yellow(contentsList[i]));
        } else if (contentsList[i].includes("Errors:")) {
            if (logSection === "Failures:") console.log(chalk.red(`\n${contentsList[i]}`));
            else console.log(chalk.red(`\n\n${contentsList[i]}`));
            logSection = "Errors:";
        } else if (logSection === "Errors:" && !contentsList[i].includes("Log created at:")) {
            console.log(chalk.red(contentsList[i]));
        } else if (contentsList[i].includes("Log created at:")) {
            if (logSection === "") console.log(chalk.white(`\n${contentsList[i]}`));
            else console.log(chalk.white(`${contentsList[i]}`));
        }
    }
}

/**
 * Returns `void`.
 *
 * Reset the results in the memory to start a new session.
 * To clear log file, use clear()
 */
function reset(): void {
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
 function clear(): void {
    fs.writeFileSync(logFile, '');
}

export default {
    addPassedTest,
    addFailedTest,
    addError,
    prepair,
    read,
    log,
    reset,
    clear
}