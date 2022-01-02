/**
 * @deprecated You are using node-gcm MulticastResult, which is deprecated.
 */
declare class MulticastResult {
    success: any;
    failure: any;
    canonicalIds: any;
    multicastId: any;
    results: any[];
    retryMulticastIds: any[];
    constructor();
    addResult(result: any): void;
    getTotal(): any;
}
export = MulticastResult;
