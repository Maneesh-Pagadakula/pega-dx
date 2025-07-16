import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import fs from 'fs';
import path from 'path';

const STORAGE_PATH = './resources/order-list.json';

export class CreateOrder extends PlaywrightActions {
    async executeCreateOrder(api, runtimeData) {
        try {
            const url = APIHelper.buildURL(api, runtimeData);
            const method = APIHelper.getRequestType(api);
            const headers = await APIHelper.getHeaders(api);
            const payload = await APIHelper.getRequestBody(api);
     
            // Increment IDs
            payload.orderNumber = this.incrementId(payload.orderNumber);
            payload.orderId = this.incrementId(payload.orderId);

            if (Array.isArray(payload.orderLineGroups)) {
                payload.orderLineGroups.forEach(group => {
                    if (Array.isArray(group.orderLines)) {
                        group.orderLines.forEach(line => {
                            if (line.orderLineId) {
                                line.orderLineId = this.incrementId(line.orderLineId);
                            }
                        });
                    }
                });
            }
            console.log("[LOG] Incremented Values:");
            console.log("orderId:", payload.orderId);
            console.log("orderNumber:", payload.orderNumber);

            payload.orderLineGroups.forEach((group, gIndex) => {
                group.orderLines.forEach((line, lIndex) => {
                    console.log(`Group[${gIndex}] Line[${lIndex}] orderLineId:`, line.orderLineId);
                });
            });
            console.log('Payload Path ' + api.payloadPath);
            // Save updated payload back to file if it came from a file
      if (api.payloadPath) {
        fs.writeFileSync(api.payloadPath, JSON.stringify(payload, null, 2), 'utf-8');
        console.log(`[LOG] Updated payload written to ${api.payloadPath}`);
      }

            await this.log(`API call prepared for 'Create Order Request' → Method: ${method}, URL: ${url}`);
            console.log(`[LOG] API call prepared for 'Create Order Request' - \n Method: ${method}, \n URL: ${url}`);

            const response = await APIRequestExecutor.post(url, headers, payload);

            const statusCode = response.status;
            const responseBody = response.body;

            if (statusCode === 200 && responseBody.fulfillmentInternalId) {
                await this.storeOrderId(responseBody.fulfillmentInternalId);
                await this.log(`API call for 'Create Order Request' was executed successfully with Status Code: ${statusCode}, Order ID: ${responseBody.fulfillmentInternalId}</b>`);
                console.log(`[LOG] API call for 'Create Order Request' was executed successfully - \n Status Code: ${statusCode}, \n Order ID: ${responseBody.fulfillmentInternalId}</b>`);
                return responseBody.fulfillmentInternalId;
            }

            if (statusCode === 500 && responseBody.errors?.[0]?.message === 'Duplicate Order') {
                await this.log(`API call for 'Create Order Request' failed with Status Code: ${statusCode}, Message: ${responseBody.errors?.[0]?.message}</b>`);
                console.log(`[FAIL] API call for 'Create Order Request' failed - \n Status Code: ${statusCode}, \n Message: ${responseBody.errors?.[0]?.message}`)
            } else {
                console.log(`[FAIL] Unexpected response returned - \n Status Code${statusCode}`);
            }
        } catch (e) {
            await this.log(`Failed to construct/hit the 'Create Order Request' API: ${e.message}`);
            console.log(`[FAIL] Create Order workflow failed - couldn't construct/hit the 'Create Order Request' API - \n ${e.message}`);
        }
    }

    incrementId(value) {
        if (typeof value === 'number') {
            return value + 1;
        }

        // If string like "ORD-123", extract and increment
        if (typeof value === 'string') {
            const match = value.match(/(.*?)(\d+)$/);
            if (match) {
                const prefix = match[1];
                const number = parseInt(match[2], 10) + 1;
                return `${prefix}${number}`;
            }
        }

        // Default fallback
        return value;
    }

    async storeOrderId(id) {
        const storagePath = path.resolve(STORAGE_PATH);
        let data = [];

        if (fs.existsSync(storagePath)) {
            try {
                const fileContent = fs.readFileSync(storagePath, 'utf-8');
                data = JSON.parse(fileContent);
            } catch (e) {
                console.warn('[Warning] Failed to parse fulfillment ID store. Overwriting.');
            }
        }

        data.push({
            id,
            used: false,
            createdAt: new Date().toISOString(),
        });

        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf-8');
    }
}
