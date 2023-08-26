import messageOptions from './message-options'

enum AndroidMessagePriority {
  Normal = 'NORMAL',
  High = 'HIGH',
}

interface MessageOptions {
  data?: { [key: string]: string }
  /**
   * https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#Notification
   */
  notification?: {
    title?: string
    body?: string
    /** URL of an image */
    image?: string
  }
  android?: {
    collapse_key?: string
    priority?: AndroidMessagePriority
    ttl?: string
    restricted_package_name?: string
    /**
     * If present, it will override [MessageOptions['data']]
     */
    data?: { [key: string]: string }
    notification?: AndroidNotification
    fcm_options?: {
      analytics_label?: string
    }
    direct_boot_ok?: boolean
  }
  webpush?: {
    headers?: Record<string, string>
    data?: Record<string, string>
    notification?: NotificationOptions
    fcm_options?: {
      link?: string
      analytics_label?: string
    }
  }
  apns?: {
    headers?: Record<string, string>
    payload?: Record<string, unknown> & ApnsPayload
    fcm_options?: {
      analytics_label?: string
      image?: string
    }
  }
  fcm_options?: {
    analytics_label?: string
  }
  token?: string
  topic?: string
  condition?: string
}

interface AndroidNotification {
  title?: string
  body?: string
  icon?: string
  color?: string
  sound?: string
  tag?: string
  click_action?: string
  body_loc_key?: string
  body_loc_args?: string[]
  title_loc_key?: string
  title_loc_args?: string[]
  channel_id?: string
  ticker?: string
  sticky?: boolean
  event_time?: string
  local_only?: boolean
  notification_priority?: NotificationPriority
  default_sound?: boolean
  default_vibrate_timings?: boolean
  default_light_settings?: boolean
  vibrate_timings?: string[]
  visibility?: Visibility
  notification_count?: number
  light_settings?: LightSettings
  image?: string
}

enum NotificationPriority {
  Unspecified = 'PRIORITY_UNSPECIFIED',
  Min = 'PRIORITY_MIN',
  Low = 'PRIORITY_LOW',
  Default = 'PRIORITY_DEFAULT',
  High = 'PRIORITY_HIGH',
  Max = 'PRIORITY_MAX',
}

enum Visibility {
  Unspecified = 'VISIBILITY_UNSPECIFIED',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Secret = 'SECRET',
}

interface LightSettings {
  color: Color
  light_on_duration: string
  light_off_duration: string
}

interface Color {
  red: number
  green: number
  blue: number
  alpha: number
}

interface ApnsPayload {
  alert?: {
    title?: string
    subtitle?: string
    body?: string
    'launch-image'?: string
    'title-loc-key'?: string
    'title-loc-args'?: string[]
    'subtitle-loc-key'?: string
    'subtitle-loc-args'?: string[]
    'loc-key'?: string
    'loc-args'?: string[]
  }
  badge?: number
  sound?:
    | string
    | {
        critical?: 1
        name?: 'default' | string
        /** Must be a number between 0 and 1 */
        volume?: number
      }
  'thread-id'?: string
  category?: string
  'content-available'?: 1
  'mutable-content'?: 1
  'target-content-id'?: string
  'interruption-level'?: 'passive' | 'active' | 'time-sensitive' | 'critical'
  /** Must be a number between 0 and 1 */
  'relevance-score'?: number
}

type ObjectMessageOptions = Omit<MessageOptions, 'token' | 'topic' | 'condition'>

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
