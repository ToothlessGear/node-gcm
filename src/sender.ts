import Message from './message'
import request from 'request'
import defaultsDeep from 'lodash.defaultsdeep'
import Constants from './constants'

var debug = require('debug')('node-gcm')

interface SenderOptions {}

interface SendOptions {}

type SendCallback = (err: unknown, response?: Record<string, unknown>) => void

class Sender {
  key: string
  options: SenderOptions

  constructor(key: string, options?: SenderOptions) {
    if (!(this instanceof Sender)) {
      return new Sender(key, options)
    }

    this.key = key
    this.options = options || {}
  }

  send(message: Message, recipient, callback: SendCallback)
  send(message: Message, recipient, options?: SendOptions, callback?: SendCallback)
  send(message: Message, recipient, optionsOrCallback?: SendOptions | SendCallback, callback?: SendCallback) {
    if (typeof optionsOrCallback == 'function') {
      callback = optionsOrCallback as SendCallback
      optionsOrCallback = null
    } else if (!callback) {
      callback = function () {}
    }
    const options = cleanOptions(optionsOrCallback)

    if (message.options?.data?.from) {
      console.warn("Sending a notification with the 'from' data attribute may invoke a 400 Bad Request by FCM.")
    }

    if (options.retries == 0) {
      return this.sendNoRetry(message, recipient, callback)
    }

    var self = this

    this.sendNoRetry(message, recipient, (err, response, attemptedRegTokens) => {
      if (err) {
        // Attempt to determine HTTP status code
        const statusCode = typeof err === 'number' ? err : (err as any).code || 0

        // 4xx error?
        if (statusCode > 399 && statusCode < 500) {
          debug('Error 4xx -- no use retrying. Something is wrong with the request (probably authentication?)')
          return callback(err)
        }
        return retry(self, message, recipient, options, callback)
      }
      if (!response.results) {
        return callback(null, response)
      }
      checkForBadTokens(response.results, attemptedRegTokens, function (err, unsentRegTokens, regTokenPositionMap) {
        if (err) {
          return callback(err)
        }
        if (unsentRegTokens.length == 0) {
          return callback(null, response)
        }

        debug('Retrying ' + unsentRegTokens.length + ' unsent registration tokens')

        retry(self, message, unsentRegTokens, options, function (err, retriedResponse) {
          if (err) {
            return callback(null, response)
          }
          response = updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens)
          callback(null, response)
        })
      })
    })
  }

  sendNoRetry(
    message: Message,
    recipient: string | string[],
    callback?: (err: unknown, response?: Record<string, unknown>, attemptedRegTokens?: string[]) => void
  ) {
    if (!callback) {
      callback = function () {}
    }

    getRequestBody(message, recipient, (err, body) => {
      if (err) {
        return callback(err)
      }

      //Build request options, allowing some to be overridden
      const request_options: request.RequiredUriUrl & request.CoreOptions = defaultsDeep(
        {
          method: 'POST',
          headers: {
            Authorization: 'key=' + this.key,
          },
          json: body,
        },
        this.options,
        {
          uri: Constants.GCM_SEND_URI,
          timeout: Constants.SOCKET_TIMEOUT,
        }
      )

      request(request_options, (err, res, resBodyJSON) => {
        if (err) {
          return callback(err)
        }
        if (res.statusCode >= 500) {
          debug('GCM service is unavailable (500)')
          return callback(res.statusCode)
        }
        if (res.statusCode === 401) {
          debug('Unauthorized (401). Check that your API token is correct.')
          return callback(res.statusCode)
        }
        if (res.statusCode !== 200) {
          debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON)
          return callback(res.statusCode)
        }
        if (!resBodyJSON) {
          debug('Empty response received (' + res.statusCode + ' ' + res.statusMessage + ')')
          // Spoof error code 400 to avoid retrying the request
          return callback({ error: res.statusMessage, code: 400 })
        }
        callback(null, resBodyJSON, (body.registration_ids as string[]) || [body.to as string])
      })
    })
  }
}

function cleanOptions(options) {
  if (!options || typeof options != 'object') {
    var retries = 5
    if (typeof options == 'number') {
      retries = options
    }
    return {
      retries: retries,
      backoff: Constants.BACKOFF_INITIAL_DELAY,
    }
  }

  if (typeof options.retries != 'number') {
    options.retries = 5
  }
  if (typeof options.backoff != 'number') {
    options.backoff = Constants.BACKOFF_INITIAL_DELAY
  }
  if (options.backoff > Constants.MAX_BACKOFF_DELAY) {
    options.backoff = Constants.MAX_BACKOFF_DELAY
  }

  return options
}

function retry(self, message, recipient, options, callback) {
  return setTimeout(function () {
    self.send(
      message,
      recipient,
      {
        retries: options.retries - 1,
        backoff: options.backoff * 2,
      },
      callback
    )
  }, options.backoff)
}

function checkForBadTokens(results, originalRecipients, callback) {
  var unsentRegTokens = []
  var regTokenPositionMap = []
  for (var i = 0; i < results.length; i++) {
    if (results[i].error === 'Unavailable' || results[i].error === 'InternalServerError') {
      regTokenPositionMap.push(i)
      unsentRegTokens.push(originalRecipients[i])
    }
  }
  nextTick(callback, null, unsentRegTokens, regTokenPositionMap)
}

function updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens) {
  updateResults(response.results, retriedResponse.results, regTokenPositionMap)
  updateResponseMetaData(response, retriedResponse, unsentRegTokens)
  return response
}

function updateResults(results, retriedResults, regTokenPositionMap) {
  for (var i = 0; i < results.length; i++) {
    results[regTokenPositionMap[i]] = retriedResults[i]
  }
}

function updateResponseMetaData(response, retriedResponse, unsentRegTokens) {
  response.success += retriedResponse.success
  response.canonical_ids += retriedResponse.canonical_ids
  response.failure -= unsentRegTokens.length - retriedResponse.failure
}

type RequestBodyCallback = (err: string | Error | null, body?: Record<string, unknown>) => void

function getRequestBody(message: Message, callback: RequestBodyCallback): void
function getRequestBody(message: Message, recipient: string | string[], callback: RequestBodyCallback): void
function getRequestBody(
  message: Message,
  recipientOrCallback: (string | string[]) | RequestBodyCallback,
  callback?: RequestBodyCallback
) {
  const body = message.toJson()

  if (typeof recipientOrCallback == 'string') {
    body.to = recipientOrCallback
    return nextTick(callback, null, body)
  }

  if (Array.isArray(recipientOrCallback)) {
    if (!recipientOrCallback.length) {
      return nextTick(callback, 'No recipient provided!')
    } else if (recipientOrCallback.length == 1) {
      body.to = recipientOrCallback[0]
      return nextTick(callback, null, body)
    }

    body.registration_ids = recipientOrCallback
    return nextTick(callback, null, body)
  }

  if (typeof recipientOrCallback == 'object') {
    return extractRecipient(recipientOrCallback, function (err, recipient, param) {
      if (err) {
        return callback(err)
      }
      body[param] = recipient
      return callback(null, body)
    })
  }
  return nextTick(
    callback,
    'Invalid recipient (' + recipientOrCallback + ', type ' + typeof recipientOrCallback + ') provided!'
  )
}

function nextTick<A extends unknown[], R>(func: (...args: A) => R, ...args: A) {
  process.nextTick(
    function () {
      func.apply(this, args)
    }.bind(this)
  )
}

type RecipientObject = {
  to?: string
  topic?: string
  condition?: string
  notificationKey?: string
  registrationIds?: string[]
  registrationTokens?: string[]
}

function extractRecipient(
  recipient: RecipientObject,
  callback: (error: Error | null, recipient?: string, param?: ReturnType<typeof getParamFromKey>) => void
) {
  const recipientKeys = Object.keys(recipient)

  if (recipientKeys.length !== 1) {
    return nextTick(
      callback,
      new Error('Please specify exactly one recipient key (you specified [' + recipientKeys + '])')
    )
  }

  const key = recipientKeys[0]
  const value = recipient[key]

  if (!value) {
    return nextTick(callback, new Error("Falsy value for recipient key '" + key + "'."))
  }

  const keyValidators = {
    to: isString,
    topic: isString,
    condition: isString,
    notificationKey: isString,
    registrationIds: isArray,
    registrationTokens: isArray,
  }

  const validator = keyValidators[key]
  if (!validator) {
    return nextTick(callback, new Error("Key '" + key + "' is not a valid recipient key."))
  }
  if (!validator(value)) {
    return nextTick(callback, new Error("Recipient key '" + key + "' was provided as an incorrect type."))
  }

  const param = getParamFromKey(key as keyof RecipientObject)

  return nextTick(callback, null, value, param)
}

function getParamFromKey(key: keyof RecipientObject) {
  if (key === 'condition') {
    return 'condition'
  } else if (['registrationIds', 'registrationTokens'].indexOf(key) !== -1) {
    return 'registration_ids'
  } else {
    return 'to'
  }
}

function isString(x: unknown) {
  return typeof x == 'string'
}

function isArray(x: unknown) {
  return Array.isArray(x)
}

export = Sender
