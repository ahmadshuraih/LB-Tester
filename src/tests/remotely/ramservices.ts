/**
 * 
 *
 * This test has been made especially to test whether the reemote services from 3000 to 3009 are running
 * 
 * 
 */

import axios from 'axios';

const tenants = ["51530","41321","80372","90353","90394","12345","90276","60327","60338","90349"];
const errors: string[] = [];
const servicesDown: string[] = [];

async function callRAMUsageApi(body: object): Promise<object> {
    try {
        const response = await axios({
            method: 'Post',
            url: 'https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken',
            data: body,
            headers: { 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' }
        });
        return { port: response.headers['x-server-port'] };
    } catch (error: any) {
        return { port: null };
    }
}

async function testServices(): Promise<void> {
    let succeedCounter = 0;

    for (const tenant of tenants) {
        const response = await callRAMUsageApi({"command": "inspect", "tenantId": tenant});
        const port = response['port'];
        if (port === null || port === undefined) servicesDown.push(port);
        else if (port.substring(port.length - 1) !== tenant.substring(tenant.length - 1)) errors.push(`Expected port 300${tenant.substring(tenant.length - 1)}, but got ${port}`);
        else succeedCounter ++;
    }

    console.log(`Succeed services: ${succeedCounter}/${tenants.length}`);
    console.log(`Errors: ${errors.length}/${tenants.length}`);
    console.log(`Servers down: ${servicesDown.length}/${tenants.length}`);

    if (errors.length > 0) console.log('\n');

    for (const error of errors) {
        console.log(`Error: ${error}`);
    }

    if (servicesDown.length > 0) console.log('\n');

    for (const serviceDown of servicesDown) {
        console.log(`Service down: ${serviceDown}`);
    }
}

testServices();