export class TenantAddress {
    tenantId: string;
    serverProtocol: string;
    serverName: string;
    serverPort: number;

    constructor(tenantId: string, serverProtocol: string, serverName: string, serverPort: number) {
        this.tenantId = tenantId;
        this.serverProtocol = serverProtocol;
        this.serverName = serverName;
        this.serverPort = serverPort;
    }
}