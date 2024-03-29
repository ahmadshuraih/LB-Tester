"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const configurator_1 = __importDefault(require("../configurations/configurator"));
const logFile = 'testlog.txt';
const testresultsJsonFile = 'testresults.json';
let serverBroken = false;
let totalPassedTests = 0;
let totalFailedTests = 0;
let totalErrors = 0;
let serverCapacity = 0;
let serverBreaks = 0;
let totalPassedTimeUsage = 0;
let totalFailedTimeUsage = 0;
let totalErrorsTimeUsage = 0;
let ramCapacity = 0;
let serverCapacityTimeUsage = 0;
let passedTestMaxTimeUsage = 0;
let passedTestMinTimeUsage = 100000000;
let failedTestsDescriptions = [];
let errorsDescriptions = [];
let succeedAndBrokenRequests = [{ succeed: true, total: 0 }];
let ramUsageToPlot = [];
let multiRAMUsageToPlot = {};
let multiServersTimeUsage = {};
let warmpUpRAMUsageToPLot = [];
let toPlotData = [];
let toPlotColors = [];
let warmUpProcessDuration = 0;
let testProcessDuration = 0;
/**
 * Returns `void`.
 *
 * Increase succeed and broken tests within succeedAndBrokenRequests list to give a better view at the end.
 * of how many requests can the server manages and when does it breaks.
 */
function increaseSucceedOrBrokenRequests(succeed) {
    const lastItemIndex = succeedAndBrokenRequests.length - 1;
    if (succeed === succeedAndBrokenRequests[lastItemIndex].succeed)
        succeedAndBrokenRequests[lastItemIndex].total += 1;
    else
        succeedAndBrokenRequests.push({ succeed, total: 1 });
}
/**
 * Returns `string`.
 *
 * Turn succeedAndBrokenRequests list contents into string to give a better view and to be added in testlog.txt file.
 */
function secceedAndBrokenListToString() {
    let str = 'Requests managing in server was as following during this test:';
    let counter = 0;
    for (const obj of succeedAndBrokenRequests) {
        counter += 1;
        str += `\n\t${counter}- ${obj['succeed'] ? 'Total succeed requests before breaking: ' : 'Total broken requests: '}${obj['total']}`;
    }
    return `${str}\n\n`;
}
/**
 * Returns `void`.
 *
 * Increase passed tests with 1 to know the total passed tests at the end.
 * Increase time usage (ms) during the tests to show the average at the end.
 */
function addPassedTest(timeUsage, server) {
    if (timeUsage > passedTestMaxTimeUsage)
        passedTestMaxTimeUsage = timeUsage;
    if (timeUsage < passedTestMinTimeUsage)
        passedTestMinTimeUsage = timeUsage;
    if (configurator_1.default.isMultiTimeUsageCheck()) {
        if (multiServersTimeUsage[server] === undefined) {
            multiServersTimeUsage[server] = [];
        }
        multiServersTimeUsage[server].push(timeUsage);
    }
    toPlotData.push(timeUsage);
    toPlotColors.push('green');
    totalPassedTimeUsage += timeUsage;
    totalPassedTests += 1;
    increaseSucceedOrBrokenRequests(true);
}
/**
 * Returns `void`.
 *
 * Increase failed tests with 1 and add the failure to know the total failed tests and the failures at the end.
 * Increase time usage (ms) during the tests to show the average at the end.
 */
function addFailedTest(fault, timeUsage) {
    toPlotData.push(timeUsage);
    toPlotColors.push('yellow');
    totalFailedTimeUsage += timeUsage;
    totalFailedTests += 1;
    failedTestsDescriptions.push(fault);
    increaseSucceedOrBrokenRequests(true);
}
/**
 * Returns `void`.
 *
 * Increase errors with 1 and add the error to know the total errors and the errors contexts at the end.
 */
function addError(error, timeUsage) {
    toPlotData.push(timeUsage);
    toPlotColors.push('red');
    totalErrorsTimeUsage += timeUsage;
    totalErrors += 1;
    errorsDescriptions.push(error);
}
/**
 * Returns `void`.
 *
 * Add ramUsage to be plotted at the end of logging.
 */
function addRAMUsage(ramUsage, server) {
    if (configurator_1.default.isMultiRAMCheck()) {
        if (multiRAMUsageToPlot[server] === undefined) {
            multiRAMUsageToPlot[server] = [];
        }
        multiRAMUsageToPlot[server].push(ramUsage);
    }
    else {
        ramUsageToPlot.push(ramUsage);
    }
}
/**
 * Returns `void`.
 *
 * Add warmpUpRAMUsage to be plotted at the end of logging.
 */
function addWarmpUpRAMUsage(ramUsage) {
    warmpUpRAMUsageToPLot.push(ramUsage);
}
/**
 * Returns `void`.
 *
 * Add ramUsage and RAM capacity to be plotted at the end of logging.
 */
function addRAMUsageAndCapacity(testRAMUsage) {
    ramUsageToPlot.push(testRAMUsage.usedRAM);
    ramCapacity = testRAMUsage.totalRAM;
}
/**
 * Returns `void`.
 *
 * Set the total warming up process duration
 */
function setWarmUpProcessDuration(duration) {
    warmUpProcessDuration = duration;
}
/**
 * Returns `void`.
 *
 * Set the total testing process duration
 */
function setTestProcessDuration(duration) {
    testProcessDuration = duration;
}
/**
 * Returns `void`.
 *
 * Calculate how many requests can the server manage at the same time until it breaks and how much time does that cost.
 */
function serverIsBroken() {
    if (!serverBroken) {
        serverBroken = true;
        serverCapacity = totalPassedTests + totalFailedTests + totalErrors;
        serverCapacityTimeUsage = totalPassedTimeUsage + totalFailedTimeUsage + totalErrorsTimeUsage;
    }
    serverBreaks += 1;
    increaseSucceedOrBrokenRequests(false);
}
/**
 * Returns `Promise<void>`.
 *
 * Write the tests result in the log file to see the results .
 */
async function prepair() {
    const totalTests = Number((totalPassedTests + totalFailedTests + totalErrors).toFixed(2));
    const totalTimeUsage = Number((totalPassedTimeUsage + totalFailedTimeUsage + totalErrorsTimeUsage).toFixed(2));
    const totalAverage = totalTimeUsage / totalTests;
    const passedAverage = totalPassedTimeUsage / totalPassedTests;
    const failedAverage = totalFailedTimeUsage / totalFailedTests;
    const errorsAverage = totalErrorsTimeUsage / totalErrors;
    const serverAverage = serverCapacityTimeUsage / serverCapacity;
    let logText = `Total duration of warming up process: ${warmUpProcessDuration.toFixed(2)} ms\n`;
    logText += `Total duration of testing process: ${testProcessDuration.toFixed(2)} ms\n`;
    logText += `Total tests: ${totalTests}, total time usage: ${totalTimeUsage} ms, avg time usage: ${totalAverage ? totalAverage.toFixed(2) : 0} ms\n`;
    logText += `Total passed tests: ${totalPassedTests}, total time usage: ${totalPassedTests == 0 ? 0 : totalPassedTimeUsage.toFixed(2)} ms, min time usage: ${totalPassedTests == 0 ? 0 : passedTestMinTimeUsage.toFixed(2)} ms, max time usage: ${totalPassedTests == 0 ? 0 : passedTestMaxTimeUsage.toFixed(2)} ms, avg time usage: ${passedAverage ? passedAverage.toFixed(2) : 0} ms\n`;
    if (configurator_1.default.isMultiTimeUsageCheck()) {
        //Sort multi servers time usage list
        multiServersTimeUsage = Object.keys(multiServersTimeUsage).sort().reduce((serversList, currentValue) => {
            serversList[currentValue] = multiServersTimeUsage[currentValue];
            return serversList;
        }, {});
        for (const server in multiServersTimeUsage) {
            const usedTimesList = multiServersTimeUsage[server];
            const totalTestsOnServer = usedTimesList.length;
            let totalUsedTimeOnSever = 0;
            let minTimeUsedOnServer = 100000000;
            let maxTimeUsedOnServer = 0;
            for (const timeUsage of usedTimesList) {
                totalUsedTimeOnSever += timeUsage;
                if (timeUsage > maxTimeUsedOnServer)
                    maxTimeUsedOnServer = timeUsage;
                if (timeUsage < minTimeUsedOnServer)
                    minTimeUsedOnServer = timeUsage;
            }
            const usedTimeAVGOnServer = totalUsedTimeOnSever / totalTestsOnServer;
            logText += `Total passed tests on server [${server}]: ${totalTestsOnServer}, total time usage: ${totalUsedTimeOnSever.toFixed(2)} ms, min time usage: ${minTimeUsedOnServer.toFixed(2)} ms, max time usage: ${maxTimeUsedOnServer.toFixed(2)} ms, avg time usage: ${usedTimeAVGOnServer ? usedTimeAVGOnServer.toFixed(2) : 0} ms\n`;
        }
    }
    logText += `Total failed tests: ${totalFailedTests}, total time usage: ${totalFailedTests == 0 ? 0 : totalFailedTimeUsage.toFixed(2)} ms, avg time usage: ${failedAverage ? failedAverage.toFixed(2) : 0} ms\n`;
    logText += `Total errors: ${totalErrors}, total time usage: ${totalErrors == 0 ? 0 : totalErrorsTimeUsage.toFixed(2)} ms, avg time usage: ${errorsAverage ? errorsAverage.toFixed(2) : 0} ms\n`;
    if (serverBroken)
        logText += `Server has been for first broken at request number: ${serverCapacity} 
    Total server breaks: ${serverBreaks}
    Total time usage until server first break : ${serverCapacityTimeUsage.toFixed(2)} ms, avg time usage until server first break: ${serverAverage ? serverAverage.toFixed(2) : 0} ms\n\n`;
    else
        logText += '\n';
    if (succeedAndBrokenRequests.length > 1)
        logText += secceedAndBrokenListToString();
    if (failedTestsDescriptions.length > 0)
        logText += "Failures:\n";
    for (const fault of failedTestsDescriptions)
        logText += `${fault}\n\n`;
    if (errorsDescriptions.length > 0)
        logText += "Errors:\n";
    for (const error of errorsDescriptions)
        logText += `${error}\n\n`;
    logText += `\nLog created at: ${new Date().toLocaleString()}\n`;
    fs_1.default.writeFileSync(logFile, logText);
    const testResultsWidth = toPlotData.length * 12;
    await plotTestResults(testResultsWidth);
    if (configurator_1.default.isCheckRAMUsage()) {
        if (warmpUpRAMUsageToPLot.length > 0) {
            const warmUpRAMWidth = warmpUpRAMUsageToPLot.length * 12;
            await plotWarmpUpRAMUsage(warmUpRAMWidth);
        }
        if (configurator_1.default.isMultiRAMCheck()) {
            await plotMultiTestRAMUsage();
        }
        else {
            const testRAMUsageWidth = ramUsageToPlot.length * 12;
            await plotTestRAMUsage(testRAMUsageWidth);
        }
    }
}
/**
 * Returns `Promise<void>`.
 *
 * Plot the tests used times and save it to teststimeusagechart.png file
 */
async function plotTestResults(width) {
    const height = 500; //px
    const backgroundColour = "white";
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType = "line";
    const labels = [...Array(toPlotData.length).keys()];
    labels.shift();
    labels.push(toPlotData.length);
    const configuration = {
        type: lineChartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: "",
                    data: toPlotData,
                    segment: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        borderColor: (ctx) => {
                            const xVal = ctx.p1.parsed.x;
                            return toPlotColors[xVal - 1];
                        }
                    }
                }, {
                    label: "Passed",
                    borderColor: "green",
                    data: []
                }, {
                    label: "Failed",
                    borderColor: "yellow",
                    data: []
                }, {
                    label: "Error",
                    borderColor: "red",
                    data: []
                }
            ]
        },
        options: {}
    };
    async function run() {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs_1.default.writeFileSync("teststimeusagechart.png", base64Data, 'base64');
    }
    try {
        await run();
    }
    catch (e) {
        await plotTestResults(width / 2);
    }
}
/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage during the tests and save it to testsramusagechart.png file
 */
async function plotTestRAMUsage(width) {
    const height = 500; //px
    const backgroundColour = "white";
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType = "line";
    const configuration = {
        type: lineChartType,
        data: {
            labels: [...Array(ramUsageToPlot.length).keys()],
            datasets: [
                {
                    label: `RAM usage of ${ramCapacity} bytes`,
                    borderColor: "red",
                    data: ramUsageToPlot
                }
            ]
        },
        options: {}
    };
    async function run() {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs_1.default.writeFileSync("testsramusagechart.png", base64Data, 'base64');
    }
    try {
        await run();
    }
    catch (e) {
        await plotTestRAMUsage(width / 2);
    }
}
/**
 * Returns `Promise<void>`.
 *
 * This function loops through the RAM expected servers and runs the plot for each one of them
 */
async function plotMultiTestRAMUsage() {
    for (const server in multiRAMUsageToPlot) {
        const listToPlot = multiRAMUsageToPlot[server];
        const width = listToPlot.length * 12;
        await plotOneMultiTestRAMUsage(server, listToPlot, width);
    }
}
/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage of one server during the tests and save it to testsramusagechartof[hostport].png file
 */
async function plotOneMultiTestRAMUsage(serverName, listToPlot, width) {
    const height = 500; //px
    const backgroundColour = "white";
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType = "line";
    const configuration = {
        type: lineChartType,
        data: {
            labels: [...Array(listToPlot.length).keys()],
            datasets: [
                {
                    label: `RAM usage of server ${serverName}`,
                    borderColor: "red",
                    data: listToPlot
                }
            ]
        },
        options: {}
    };
    async function run() {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs_1.default.writeFileSync(`testsramusagechartof ${serverName.replace(':', ' ')}.png`, base64Data, 'base64');
    }
    try {
        await run();
    }
    catch (e) {
        await plotOneMultiTestRAMUsage(serverName, listToPlot, width / 2);
    }
}
/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage during the warming up and save it to warmpupramusagechart.png file
 */
async function plotWarmpUpRAMUsage(width) {
    const height = 500; //px
    const backgroundColour = "white";
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType = "line";
    const configuration = {
        type: lineChartType,
        data: {
            labels: [...Array(warmpUpRAMUsageToPLot.length).keys()],
            datasets: [
                {
                    label: `RAM usage of ${ramCapacity} bytes`,
                    borderColor: "blue",
                    data: warmpUpRAMUsageToPLot
                }
            ]
        },
        options: {}
    };
    async function run() {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs_1.default.writeFile("warmpupramusagechart.png", base64Data, 'base64', (err) => { if (err)
            console.log(err); });
    }
    try {
        await run();
    }
    catch (e) {
        await plotWarmpUpRAMUsage(width / 2);
    }
}
/**
 * Returns `void`.
 *
 * This function writes the test result objects to testresults.json file.
 */
async function writeJsonTestResults(testResultObjects) {
    fs_1.default.writeFileSync(testresultsJsonFile, JSON.stringify({ testResultObjects }, null, 4));
}
/**
 * Returns `Promise<string>`.
 *
 * Read the latest tests results from the log file .
 */
function readTestLog() {
    return fs_1.default.readFileSync(logFile).toString();
}
/**
 * Returns `void`.
 *
 * Read the latest tests results from the log file and log it colored into the console.
 */
function log() {
    let logSection = "";
    const logFileContents = readTestLog();
    const contentsList = logFileContents.split('\n');
    console.log(chalk_1.default.magenta(contentsList[0]));
    console.log(chalk_1.default.magenta(contentsList[1]));
    console.log(chalk_1.default.blue(contentsList[2]));
    for (let i = 3; i < contentsList.length; i++) {
        if (contentsList[i].includes("Total passed tests")) {
            console.log(chalk_1.default.green(contentsList[i]));
        }
        else if (contentsList[i].includes("Total failed tests")) {
            console.log(chalk_1.default.yellow(contentsList[i]));
        }
        else if (contentsList[i].includes("Total errors")) {
            console.log(chalk_1.default.red(contentsList[i]));
        }
        else if (contentsList[i].includes("Failures:")) {
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
    console.log(`\n[${new Date().toLocaleTimeString()}] LBTester: logging phase has been finished\n\n[${new Date().toLocaleTimeString()}] LBTester: has been finished ;-)\n`);
}
/**
 * Returns `void`.
 *
 * Reset the results in the memory to start a new session.
 * To clear log file, use clear()
 */
function reset() {
    serverBroken = false;
    totalPassedTests = 0;
    totalFailedTests = 0;
    totalErrors = 0;
    serverCapacity = 0;
    serverBreaks = 0;
    totalPassedTimeUsage = 0;
    totalFailedTimeUsage = 0;
    totalErrorsTimeUsage = 0;
    ramCapacity = 0;
    serverCapacityTimeUsage = 0;
    passedTestMaxTimeUsage = 0;
    passedTestMinTimeUsage = 1000000;
    failedTestsDescriptions = [];
    errorsDescriptions = [];
    succeedAndBrokenRequests = [{ succeed: true, total: 0 }];
    ramUsageToPlot = [];
    multiRAMUsageToPlot = {};
    multiServersTimeUsage = {};
    warmpUpRAMUsageToPLot = [];
    toPlotData = [];
    toPlotColors = [];
}
/**
 * Returns `Promise<void>`.
 *
 * Clear the contents of the log files.
 */
function clear() {
    fs_1.default.writeFileSync(logFile, '');
    fs_1.default.writeFileSync(testresultsJsonFile, '');
}
exports.default = {
    addPassedTest,
    addFailedTest,
    addError,
    addRAMUsage,
    addWarmpUpRAMUsage,
    addRAMUsageAndCapacity,
    setWarmUpProcessDuration,
    setTestProcessDuration,
    serverIsBroken,
    prepair,
    writeJsonTestResults,
    readTestLog,
    log,
    reset,
    clear
};
