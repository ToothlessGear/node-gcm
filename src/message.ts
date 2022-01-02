import messageOptions from './message-options'

interface MessageOptions {
  priority?: 'normal' | 'high'
  notification?: {
    title?: string
    icon?: string
    body?: string
  }
  data?: Record<string, unknown>
}

type ObjectMessageOptions = Omit<MessageOptions, 'priority'>

class Message {
  options: MessageOptions

  constructor(options?: MessageOptions) {
    if (!(this instanceof Message)) {
      return new Message()
    }

    this.options = options || {}
  }

  addNotification(object: MessageOptions['notification']): void
  addNotification<K extends keyof MessageOptions['notification']>(
    key: K,
    value: MessageOptions['notification'][K]
  ): void
  addNotification<K extends keyof MessageOptions['notification']>(
    objectOrKey: MessageOptions['notification'] | K,
    value?: MessageOptions['notification'][K]
  ) {
    return this.handleParamSet(
      value !== undefined ? [objectOrKey as K, value] : [objectOrKey as MessageOptions['notification']],
      'notification'
    )
  }

  addData(object: MessageOptions['data']): void
  addData<K extends keyof MessageOptions['data']>(key: K, value: MessageOptions['data'][K]): void
  addData<K extends keyof MessageOptions['data']>(
    objectOrKey: MessageOptions['data'] | K,
    value?: MessageOptions['data'][K]
  ) {
    return this.handleParamSet(
      value !== undefined ? [objectOrKey as K, value] : [objectOrKey as MessageOptions['data']],
      'data'
    )
  }

  toJson() {
    const json: Record<string, unknown> = {}

    for (const key of Object.keys(this.options)) {
      const optionDescription = messageOptions[key]

      if (!optionDescription) {
        continue
      }

      const jsonKey = optionDescription.__argName || key
      json[jsonKey] = this.options[key]
    }

    return json
  }

  /**
   * @deprecated Please use Message#addData instead.
   */
  addDataWithKeyValue<K extends keyof MessageOptions['data'], V extends MessageOptions['data'][K]>(key: K, value: V) {
    console.warn('Message#addDataWithKeyValue has been deprecated. Please use Message#addData instead.')
    this.addData(key, value)
  }

  /**
   * @deprecated Please use Message#addData instead.
   */
  addDataWithObject(obj: MessageOptions['data']) {
    console.warn('Message#addDataWithObject has been deprecated. Please use Message#addData instead.')
    this.addData(obj)
  }

  private handleParamSet<P extends keyof ObjectMessageOptions, K extends keyof ObjectMessageOptions[P]>(
    args: [MessageOptions[P]] | [K, MessageOptions[P][K]],
    paramType: P
  ) {
    if (args.length == 1) {
      return this.setOption(paramType, args[0])
    } else if (args.length == 2) {
      return this.addOption(paramType, args[0], args[1])
    }
  }

  private addOption<P extends keyof ObjectMessageOptions, K extends keyof ObjectMessageOptions[P]>(
    paramType: P,
    key: K,
    value: MessageOptions[P][K]
  ) {
    if (!this.options[paramType]) {
      this.options[paramType] = {}
    }
    return (this.options[paramType][key] = value)
  }

  private setOption<P extends keyof MessageOptions>(paramType: P, obj: MessageOptions[P]) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
      this.options[paramType] = obj
    }
  }
}

export = Message
