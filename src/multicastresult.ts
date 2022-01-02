/**
 * @deprecated You are using node-gcm MulticastResult, which is deprecated.
 */
export default class MulitcastResult {
  success = undefined;
  failure = undefined;
  canonicalIds = undefined;
  multicastId = undefined;
  results = [];
  retryMulticastIds = [];

  constructor() {
    console.warn(
      "You are using node-gcm MulticastResult, which is deprecated."
    );
  }

  addResult(result: any) {
    this.results.push(result);
  }

  getTotal() {
    return this.success + this.failure;
  }
}
