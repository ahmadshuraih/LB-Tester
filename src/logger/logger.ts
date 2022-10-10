import fs from 'fs';
import chalk from 'chalk';
import { MultiRAMPLotList, SucceedOrBrokenTotal, TestRAMUsage, TestResultObject } from '../types';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartType } from 'chart.js';
import configurator from '../configurations/configurator';

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
let passedTestMinTimeSpent = 1000000;
let failedTestsDescriptions: string[] = [];
let errorsDescriptions: string[] = [];
let succeedAndBrokenRequests: SucceedOrBrokenTotal[] = [{succeed: true, total: 0}];
let ramUsageToPlot: number[] = [];
let multiRAMUsageToPlot: MultiRAMPLotList = {};
let warmpUpRAMUsageToPLot: number[] = [];
let toPlotData: number[] = [];
let toPlotColors: string[] = [];
let plotTestResultsWidth = 0;
let plotTestRAMUsageWidth = 0;
let plotOneMultiTestRAMUsageWidth = 0;
let plotWarmpUpRAMUsageWidth = 0;

/**
 * Returns `void`.
 *
 * Increase succeed and broken tests within succeedAndBrokenRequests list to give a better view at the end.
 * of how many requests can the server manages and when does it breaks.
 */
function increaseSucceedOrBrokenRequests(succeed: boolean): void {
    const lastItemIndex = succeedAndBrokenRequests.length - 1;
    if (succeed === succeedAndBrokenRequests[lastItemIndex].succeed) succeedAndBrokenRequests[lastItemIndex].total += 1;
    else succeedAndBrokenRequests.push({succeed, total: 1});
}

/**
 * Returns `string`.
 *
 * Turn succeedAndBrokenRequests list contents into string to give a better view and to be added in testlog.txt file.
 */
function secceedAndBrokenListToString(): string {
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
function addPassedTest(timeSpent: number): void {
    if (timeSpent > passedTestMaxTimeSpent) passedTestMaxTimeSpent = timeSpent;
    if (timeSpent < passedTestMinTimeSpent) passedTestMinTimeSpent = timeSpent;
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
function addFailedTest(fault: string, timeSpent: number): void {
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
function addError(error: string, timeSpent: number): void {
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
function addRAMUsage(ramUsage: number, server: string): void {
    if (configurator.isMultiRAMCheck()) {
        if (multiRAMUsageToPlot[server] === undefined) {
            multiRAMUsageToPlot[server] = [];
        }
        multiRAMUsageToPlot[server].push(ramUsage);
    } else {
        ramUsageToPlot.push(ramUsage);
    }
}

/**
 * Returns `void`.
 *
 * Add warmpUpRAMUsage to be plotted at the end of logging.
 */
 function addWarmpUpRAMUsage(ramUsage: number): void {
    warmpUpRAMUsageToPLot.push(ramUsage);
}

/**
 * Returns `void`.
 *
 * Add ramUsage and RAM capacity to be plotted at the end of logging.
 */
 function addRAMUsageAndCapacity(testRAMUsage: TestRAMUsage): void {
    ramUsageToPlot.push(testRAMUsage.usedRAM);
    ramCapacity = testRAMUsage.totalRAM;
}

/**
 * Returns `void`.
 *
 * Calculate how many requests can the server manage at the same time until it breaks and how much time does that cost.
 */
function serverIsBroken(): void {
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
async function prepair(): Promise<void> {
    const totalTests = Number((totalPassedTests + totalFailedTests + totalErrors).toFixed(2));
    const totalTimeSpent = Number((totalPassedTimeSpent + totalFailedTimeSpent + totalErrorsTimeSpent).toFixed(2));
    const totalAverage = totalTimeSpent / totalTests;
    const passedAverage = totalPassedTimeSpent / totalPassedTests;
    const failedAverage = totalFailedTimeSpent / totalFailedTests;
    const errorsAverage = totalErrorsTimeSpent / totalErrors;
    const serverAverage = serverCapacityTimeSpent / serverCapacity;

    let logText = `Total tests: ${totalTests}, total time spent: ${totalTimeSpent} ms, avg time spent: ${totalAverage ? totalAverage.toFixed(2) : 0} ms\n`;
    logText += `Total passed tests: ${totalPassedTests}, total time spent: ${totalPassedTimeSpent.toFixed(2)} ms, min time spent: ${passedTestMinTimeSpent.toFixed(2)} ms, max time spent: ${passedTestMaxTimeSpent.toFixed(2)} ms, avg time spent: ${passedAverage ? passedAverage.toFixed(2) : 0} ms\n`;
    logText += `Total failed tests: ${totalFailedTests}, total time spent: ${totalFailedTimeSpent.toFixed(2)} ms, avg time spent: ${failedAverage ? failedAverage.toFixed(2) : 0} ms\n`;
    logText += `Total errors: ${totalErrors}, total time spent: ${totalErrorsTimeSpent.toFixed(2)} ms, avg time spent: ${errorsAverage ? errorsAverage.toFixed(2) : 0} ms\n`;

    if (serverBroken) logText += `Server has been for first broken at request number: ${serverCapacity} 
    Total server breaks: ${serverBreaks}
    Total time spent until server first break : ${serverCapacityTimeSpent.toFixed(2)} ms, avg time spent until server first break: ${serverAverage ? serverAverage.toFixed(2) : 0} ms\n\n`;
    else logText += '\n';

    if (succeedAndBrokenRequests.length > 1) logText += secceedAndBrokenListToString();

    if (failedTestsDescriptions.length > 0) logText += "Failures:\n";
    
    for (const fault of failedTestsDescriptions) logText += `${fault}\n\n`;

    if (errorsDescriptions.length > 0) logText += "Errors:\n";
    
    for (const error of errorsDescriptions) logText += `${error}\n\n`;

    logText += `\nLog created at: ${new Date().toLocaleString()}\n`;

    fs.writeFileSync(logFile, logText);

    plotTestResultsWidth = toPlotData.length * 12;
    await plotTestResults();
    if (configurator.isCheckRAMUsage()) {
        plotWarmpUpRAMUsageWidth = warmpUpRAMUsageToPLot.length * 12;
        await plotWarmpUpRAMUsage();
        if (configurator.isMultiRAMCheck()) {
            await plotMultiTestRAMUsage();
        } else {
            plotTestRAMUsageWidth = ramUsageToPlot.length * 12;
            await plotTestRAMUsage();
        }
    }
}

/**
 * Returns `Promise<void>`.
 *
 * Plot the tests spent times and save it to teststimespentchart.png file
 */
async function plotTestResults(): Promise<void> {
    const width = plotTestResultsWidth; //px
    const height = 500; //px
    const backgroundColour = "white"; 
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType: ChartType = "line";
    const labels = [...Array(toPlotData.length).keys()];
    labels.shift();
    labels.push(toPlotData.length);

    const configuration = {
        type: lineChartType,   // for line chart
        data: {
            labels: labels,
            datasets: [
                {
                    label: "",
                    data: toPlotData,
                    segment: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        borderColor: (ctx: any): string => {
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
    }

    async function run(): Promise<void> {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync("teststimespentchart.png", base64Data, 'base64');
    }

    try {
        await run();
    } catch (e: unknown) {
        plotTestResultsWidth = plotTestResultsWidth / 2;
        await plotTestResults();
    }
}

/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage during the tests and save it to testsramusagechart.png file
 */
async function plotTestRAMUsage(): Promise<void> {
    const width = plotTestRAMUsageWidth; //px
    const height = 500; //px
    const backgroundColour = "white"; 
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType: ChartType = "line";

    const configuration = {
        type: lineChartType,   // for line chart
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
    }

    async function run(): Promise<void> {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync("testsramusagechart.png", base64Data, 'base64');
    }

    try {
        await run();
    } catch (e: unknown) {
        plotTestRAMUsageWidth = plotTestRAMUsageWidth / 2;
        await plotTestRAMUsage();
    }
}

/**
 * Returns `Promise<void>`.
 *
 * This function loops through the RAM expected servers and runs the plot for each one of them
 */
async function plotMultiTestRAMUsage(): Promise<void> {
    for (const server in multiRAMUsageToPlot) {
        const listToPlot = multiRAMUsageToPlot[server];
        plotOneMultiTestRAMUsageWidth = listToPlot.length * 12;
        await plotOneMultiTestRAMUsage(server, listToPlot);
    }
}

/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage of one server during the tests and save it to testsramusagechartof[hostport].png file
 */
async function plotOneMultiTestRAMUsage(serverName:string, listToPlot: number[]): Promise<void> {
    const width = plotOneMultiTestRAMUsageWidth;
    const height = 500; //px
    const backgroundColour = "white"; 
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType: ChartType = "line";

    const configuration = {
        type: lineChartType,   // for line chart
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
    }

    async function run(): Promise<void> {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(`testsramusagechartof(${serverName.replace(':','|')}).png`, base64Data, 'base64');
    }

    try {
        await run();
    } catch (e: unknown) {
        plotOneMultiTestRAMUsageWidth = plotOneMultiTestRAMUsageWidth / 2;
        await plotOneMultiTestRAMUsage(serverName, listToPlot);
    }
}

/**
 * Returns `Promise<void>`.
 *
 * Plot the RAM usage during the warming up and save it to warmpupramusagechart.png file
 */
 async function plotWarmpUpRAMUsage(): Promise<void> {
    const width = plotWarmpUpRAMUsageWidth; //px
    const height = 500; //px
    const backgroundColour = "white"; 
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const lineChartType: ChartType = "line";

    const configuration = {
        type: lineChartType,   // for line chart
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
    }

    async function run(): Promise<void> {
        const base64Image = await chartJSNodeCanvas.renderToDataURL(configuration);
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        fs.writeFile("warmpupramusagechart.png", base64Data, 'base64', (err: unknown): void => { if (err) console.log(err) });
    }

    try {
        await run();
    } catch (e: unknown) {
        plotWarmpUpRAMUsageWidth = plotWarmpUpRAMUsageWidth / 2;
        await plotWarmpUpRAMUsage();
    }
}

/**
 * Returns `void`.
 *
 * This function writes the test result objects to testresults.json file.
 */
async function writeJsonTestResults(testResultObjects: TestResultObject[]): Promise<void> {
    fs.writeFileSync(testresultsJsonFile, JSON.stringify({testResultObjects}));
}

/**
 * Returns `Promise<string>`.
 *
 * Read the latest tests results from the log file .
 */
function readTestLog(): string {
    return fs.readFileSync(logFile).toString();
}

/**
 * Returns `void`.
 *
 * Read the latest tests results from the log file and log it colored into the console.
 */
function log(): void {
    let logSection = "";
    const logFileContents = readTestLog();
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

    console.log("\nLBTester: logging fase has been finished\n\nLBTester: has been finished ;-)\n");
}

/**
 * Returns `void`.
 *
 * Reset the results in the memory to start a new session.
 * To clear log file, use clear()
 */
function reset(): void {
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
    succeedAndBrokenRequests = [{succeed: true, total: 0}];
    ramUsageToPlot = [];
    multiRAMUsageToPlot = {};
    warmpUpRAMUsageToPLot = [];
    toPlotData = [];
    toPlotColors = [];
}

/**
 * Returns `Promise<void>`.
 *
 * Clear the contents of the log files.
 */
 function clear(): void {
    fs.writeFileSync(logFile, '');
    fs.writeFileSync(testresultsJsonFile, '');
}

export default {
    addPassedTest,
    addFailedTest,
    addError,
    addRAMUsage,
    addWarmpUpRAMUsage,
    addRAMUsageAndCapacity,
    serverIsBroken,
    prepair,
    writeJsonTestResults,
    readTestLog,
    log,
    reset,
    clear
}