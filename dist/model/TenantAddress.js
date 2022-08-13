"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAddress = void 0;
class TenantAddress {
    tenantId;
    serverProtocol;
    serverName;
    serverPort;
    constructor(tenantId, serverProtocol, serverName, serverPort) {
        this.tenantId = tenantId;
        this.serverProtocol = serverProtocol;
        this.serverName = serverName;
        this.serverPort = serverPort;
    }
}
exports.TenantAddress = TenantAddress;
