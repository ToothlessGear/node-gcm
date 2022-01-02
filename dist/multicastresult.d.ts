/**
 * @deprecated You are using node-gcm MulticastResult, which is deprecated.
 */
export default class MulitcastResult {
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
