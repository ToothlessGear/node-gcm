interface MessageOptions {
    priority?: 'normal' | 'high';
    notification?: {
        title?: string;
        icon?: string;
        body?: string;
    };
    data?: Record<string, unknown>;
}
declare class Message {
    options: MessageOptions;
    constructor(options?: MessageOptions);
    addNotification(object: MessageOptions['notification']): void;
    addNotification<K extends keyof MessageOptions['notification']>(key: K, value: MessageOptions['notification'][K]): void;
    addData(object: MessageOptions['data']): void;
    addData<K extends keyof MessageOptions['data']>(key: K, value: MessageOptions['data'][K]): void;
    toJson(): Record<string, unknown>;
    /**
     * @deprecated Please use Message#addData instead.
     */
    addDataWithKeyValue<K extends keyof MessageOptions['data'], V extends MessageOptions['data'][K]>(key: K, value: V): void;
    /**
     * @deprecated Please use Message#addData instead.
     */
    addDataWithObject(obj: MessageOptions['data']): void;
    private handleParamSet;
    private addOption;
    private setOption;
}
export = Message;
