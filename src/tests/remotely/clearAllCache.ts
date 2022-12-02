/**
 * 
 *
 * This code has been made especially to clear the cache in all remote services from 3000 to 3009
 * 
 * 
 */

import axios from 'axios';

const tenants = ["51530","41321","80372","90353","90394","12345","90276","60327","60338","90349"];
const errors: string[] = [];
const servicesDown: string[] = [];

async function clearCacheUsingApi(body: object): Promise<object> {
    try {
        const response = await axios({
            method: 'Post',
            url: 'https://lbtest.latestcollection.fashion/loadbalancer/data?token=MasterTestToken',
            data: body,
            headers: { 'Accept-Encoding': 'gzip', 'authenticationtoken': 'MasterTestToken' }
        });
        return { port: response.headers['x-server-port'], data: response.data };
    } catch (error: any) {
        return { port: null };
    }
}

async function clearServicesCache(): Promise<void> {
    let succeedCounter = 0;

    for (const tenant of tenants) {
        const response = await clearCacheUsingApi({ "command": "clearCache", "collection": "*", "tenantId": tenant });
        const port = response['port'];
        const data = response['data'] ? response['data']['response'] : "";
        if (port === null || port === undefined) servicesDown.push(tenant);
        else if (port.substring(port.length - 1) !== tenant.substring(tenant.length - 1)) errors.push(`Expected port 300${tenant.substring(tenant.length - 1)}, but got ${port}`);
        else if (data !== 'OK') errors.push(`The cache in service 300${tenant.substring(tenant.length - 1)} has been not cleared. Expected OK, but got ${data}`);
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
        console.log(`Service down of tenant: ${serviceDown}`);
    }
}

clearServicesCache();