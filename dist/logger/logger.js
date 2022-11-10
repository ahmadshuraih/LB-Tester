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
let totalPassedTimeSpent = 0;
let totalFailedTimeSpent = 0;
let totalErrorsTimeSpent = 0;
let ramCapacity = 0;
let serverCapacityTimeSpent = 0;
let passedTestMaxTimeSpent = 0;
let passedTestMinTimeSpent = 100000000;
let failedTestsDescriptions = [];
let errorsDescriptions = [];
let succeedAndBrokenRequests = [{ succeed: true, total: 0 }];
let ramUsageToPlot = [];
let multiRAMUsageToPlot = {};
let multiServersTimeSpent = {};
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
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addPassedTest(timeSpent, server) {
    if (timeSpent > passedTestMaxTimeSpent)
        passedTestMaxTimeSpent = timeSpent;
    if (timeSpent < passedTestMinTimeSpent)
        passedTestMinTimeSpent = timeSpent;
    if (configurator_1.default.isMultiTimeSpentCheck()) {
        if (multiServersTimeSpent[server] === undefined) {
            multiServersTimeSpent[server] = [];
        }
        multiServersTimeSpent[server].push(timeSpent);
    }
    toPlotData.push(timeSpent);
    toPlotColors.push('green');
    totalPassedTimeSpent += timeSpent;
    totalPassedTests += 1;
    increaseSucceedOrBrokenRequests(true);
}
/**
 * Returns `void`.
 *
 * Increase failed tests with 1 and add the failure to know the total failed tests and the failures at the end.
 * Increase time spent (ms) during the tests to show the average at the end.
 */
function addFailedTest(fault, timeSpent) {
    toPlotData.push(timeSpent);
    toPlotColors.push('yellow');
    totalFailedTimeSpent += timeSpent;
    totalFailedTests += 1;
    failedTestsDescriptions.push(fault);
    increaseSucceedOrBrokenRequests(true);
}
/**
 * Returns `void`.
 *
 * Increase errors with 1 and add the error to know the total errors and the errors contexts at the end.
 */
function addError(error, timeSpent) {
    toPlotData.push(timeSpent);
    toPlotColors.push('red');
    totalErrorsTimeSpent += timeSpent;
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
        serverCapacityTimeSpent = totalPassedTimeSpent + totalFailedTimeSpent + totalErrorsTimeSpent;
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
    const totalTimeSpent = Number((totalPassedTimeSpent + totalFailedTimeSpent + totalErrorsTimeSpent).toFixed(2));
    const totalAverage = totalTimeSpent / totalTests;
    const passedAverage = totalPassedTimeSpent / totalPassedTests;
    const failedAverage = totalFailedTimeSpent / totalFailedTests;
    const errorsAverage = totalErrorsTimeSpent / totalErrors;
    const serverAverage = serverCapacityTimeSpent / serverCapacity;
    let logText = `Total duration of warming up process: ${warmUpProcessDuration.toFixed(2)} ms\n`;
    logText += `Total duration of testing process: ${testProcessDuration.toFixed(2)} ms\n`;
    logText += `Total tests: ${totalTests}, total time spent: ${totalTimeSpent} ms, avg time spent: ${totalAverage ? totalAverage.toFixed(2) : 0} ms\n`;
    logText += `Total passed tests: ${totalPassedTests}, total time spent: ${totalPassedTimeSpent.toFixed(2)} ms, min time spent: ${passedTestMinTimeSpent.toFixed(2)} ms, max time spent: ${passedTestMaxTimeSpent.toFixed(2)} ms, avg time spent: ${passedAverage ? passedAverage.toFixed(2) : 0} ms\n`;
    if (configurator_1.default.isMultiTimeSpentCheck()) {
        //Sort multi servers time spent list
        multiServersTimeSpent = Object.keys(multiServersTimeSpent).reduce((serversList, currentValue) => {
            serversList[currentValue] = multiServersTimeSpent[currentValue];
            return serversList;
        }, {});
        for (const server in multiServersTimeSpent) {
            const spentTimesList = multiServersTimeSpent[server];
            const totalTestsOnServer = spentTimesList.length;
            let totalSpentTimeOnSever = 0;
            let minTimeSpentOnServer = 100000000;
            let maxTimeSpentOnServer = 0;
            for (const timeSpent of spentTimesList) {
                totalSpentTimeOnSever += timeSpent;
                if (timeSpent > maxTimeSpentOnServer)
                    maxTimeSpentOnServer = timeSpent;
                if (timeSpent < minTimeSpentOnServer)
                    minTimeSpentOnServer = timeSpent;
            }
            const spentTimeAVGOnServer = totalSpentTimeOnSever / totalTestsOnServer;
            logText += `Total passed tests on server [${server}]: ${totalTestsOnServer}, total time spent: ${totalSpentTimeOnSever.toFixed(2)} ms, min time spent: ${minTimeSpentOnServer.toFixed(2)} ms, max time spent: ${maxTimeSpentOnServer.toFixed(2)} ms, avg time spent: ${spentTimeAVGOnServer ? spentTimeAVGOnServer.toFixed(2) : 0} ms\n`;
        }
    }
    logText += `Total failed tests: ${totalFailedTests}, total time spent: ${totalFailedTimeSpent.toFixed(2)} ms, avg time spent: ${failedAverage ? failedAverage.toFixed(2) : 0} ms\n`;
    logText += `Total errors: ${totalErrors}, total time spent: ${totalErrorsTimeSpent.toFixed(2)} ms, avg time spent: ${errorsAverage ? errorsAverage.toFixed(2) : 0} ms\n`;
    if (serverBroken)
        logText += `Server has been for first broken at request number: ${serverCapacity} 
    Total server breaks: ${serverBreaks}
    Total time spent until server first break : ${serverCapacityTimeSpent.toFixed(2)} ms, avg time spent until server first break: ${serverAverage ? serverAverage.toFixed(2) : 0} ms\n\n`;
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
 * Plot the tests spent times and save it to teststimespentchart.png file
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
        fs_1.default.writeFileSync("teststimespentchart.png", base64Data, 'base64');
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
    fs_1.default.writeFileSync(testresultsJsonFile, JSON.stringify({ testResultObjects }));
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
    console.log(chalk_1.default.green(contentsList[3]));
    console.log(chalk_1.default.yellow(contentsList[4]));
    console.log(chalk_1.default.red(contentsList[5]));
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
    console.log("\nLBTester: logging fase has been finished\n\nLBTester: has been finished ;-)\n");
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
    totalPassedTimeSpent = 0;
    totalFailedTimeSpent = 0;
    totalErrorsTimeSpent = 0;
    ramCapacity = 0;
    serverCapacityTimeSpent = 0;
    passedTestMaxTimeSpent = 0;
    passedTestMinTimeSpent = 1000000;
    failedTestsDescriptions = [];
    errorsDescriptions = [];
    succeedAndBrokenRequests = [{ succeed: true, total: 0 }];
    ramUsageToPlot = [];
    multiRAMUsageToPlot = {};
    multiServersTimeSpent = {};
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
