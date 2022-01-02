/**
 * @deprecated You are using node-gcm Result which is deprecated
 */
function Result() {
  this.messageId = undefined
  this.canonicalRegistrationId = undefined
  this.errorCode = undefined

  console.warn('You are using node-gcm Result which is deprecated')
}

export = Result
