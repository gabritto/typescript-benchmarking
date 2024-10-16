export {};
// Adapted from ts-error-deltas repos

type HelperCond<T, A, R1, B, R2> =
    T extends A
        ? R1
        : T extends B
            ? R2
            : never;


// File: Rocket.Chat/apps/meteor/app/katex/client/index.ts
interface IMessage {
    html?: string;
    tokens?: {}[];
}

class NewKatex {
    render(s: string): string {
        return "";
    }

    renderMessage(message: string): string;
    renderMessage(message: IMessage): IMessage;
    renderMessage(message: string | IMessage): string | IMessage;
    renderMessage(message: string | IMessage): string | IMessage {
        if (typeof message === 'string') {
            return this.render(message); // Ok
        }

        if (!message.html?.trim()) {
            return message; // Ok
        }

        if (!message.tokens) {
            message.tokens = [];
        }

        message.html = this.render(message.html);
        return message; // Ok
    }
}

export function createKatexMessageRendering(options: { dollarSyntax: boolean; parenthesisSyntax: boolean; }, _isMessage: false): (message: string) => string;
export function createKatexMessageRendering(options: { dollarSyntax: boolean; parenthesisSyntax: boolean; }, _isMessage: true): (message: IMessage) => IMessage;
export function createKatexMessageRendering(options: { dollarSyntax: boolean; parenthesisSyntax: boolean; }, _isMessage: boolean): ((message: IMessage) => IMessage) | ((message: string) => string);
export function createKatexMessageRendering(options: { dollarSyntax: boolean; parenthesisSyntax: boolean; }, _isMessage: boolean): ((message: IMessage) => IMessage) | ((message: string) => string) {
    const instance = new NewKatex();
    if (_isMessage) {
        return (message: IMessage): IMessage => instance.renderMessage(message); // Ok
    }
    return (message: string): string => instance.renderMessage(message); // Ok
}

// File: Rocket.Chat/apps/meteor/app/settings/lib/settings.ts
type SettingComposedValue<T extends SettingValue = SettingValue> = { key: string; value: T };
type SettingCallback = (key: string, value: SettingValue, initialLoad?: boolean) => void;

type SettingValue = object;
declare const Meteor: { settings: { [s: string]: any } };
declare const _: { isRegExp(x: unknown): x is RegExp; };

class NewSettingsBase {
    public newGet<T extends SettingValue = SettingValue>(_id: RegExp, callback?: undefined): SettingComposedValue<T>[];
    public newGet<T extends SettingValue = SettingValue>(_id: string, callback?: undefined): T | undefined;
    public newGet<T extends SettingValue = SettingValue>(_id: string | RegExp, callback: SettingCallback): void;
    public newGet<T extends SettingValue = SettingValue>(_id: string | RegExp, callback?: SettingCallback | undefined): void | T | undefined | SettingComposedValue<T>[];
    public newGet<T extends SettingValue = SettingValue>(_id: string | RegExp, callback?: SettingCallback | undefined): void | T | undefined | SettingComposedValue<T>[] {
        if (callback !== undefined) {
            if (!Meteor.settings) {
                return; // Ok
            }
            if (_id === '*') {
                return Object.keys(Meteor.settings).forEach((key) => { // Ok
                    const value = Meteor.settings[key];
                    callback(key, value);
                });
            }
            if (_.isRegExp(_id) && Meteor.settings) {
                return Object.keys(Meteor.settings).forEach((key) => { // Ok
                    if (!_id.test(key)) {
                        return;
                    }
                    const value = Meteor.settings[key];
                    callback(key, value);
                });
            }

            if (typeof _id === 'string') {
                const value = Meteor.settings[_id];
                if (value != null) {
                    callback(_id, Meteor.settings[_id]);
                }
                return; // Ok
            }

            return; // Ok, needed for exhaustiveness check
        }

        if (!Meteor.settings) { // Wrong: we don't know that _id is string here, cannot return undefined
            return undefined; // Error
        }

        if (_.isRegExp(_id)) {
            return Object.keys(Meteor.settings).reduce((items: SettingComposedValue<T>[], key) => {
				const value = Meteor.settings[key];
				if (_id.test(key)) {
					items.push({
						key,
						value,
					});
				}
				return items;
			}, []); // Ok
        }

        return Meteor.settings?.[_id]; // Error
        // The indexing currently doesn't work because it doesn't use the narrowed type of `_id`.
    }
}

// File: Rocket.Chat/apps/meteor/app/ui-utils/client/lib/messageBox.ts
type MessageBoxAction = object;

function getWithBug(group: undefined): Record<string, MessageBoxAction[]>;
function getWithBug(group: string): MessageBoxAction[];
function getWithBug(group: string | undefined): MessageBoxAction[] | Record<string, MessageBoxAction[]>;
function getWithBug(group: string | undefined): MessageBoxAction[] | Record<string, MessageBoxAction[]> {
    if (!group) {
        return {} as Record<string, MessageBoxAction[]>; // Error, could fall into this branch when group is empty string
    }

    return [] as MessageBoxAction[]; // Ok
}

function getWithoutBug(group: undefined): Record<string, MessageBoxAction[]>;
function getWithoutBug(group: string): MessageBoxAction[];
function getWithoutBug(group: string | undefined): MessageBoxAction[] | Record<string, MessageBoxAction[]>;
function getWithoutBug(group: string | undefined): MessageBoxAction[] | Record<string, MessageBoxAction[]> {
    if (group === undefined) {
        return {} as Record<string, MessageBoxAction[]>; // Ok
    }

    return [] as MessageBoxAction[]; // Ok
}

// File: Rocket.Chat/apps/meteor/ee/server/lib/engagementDashboard/date.ts
declare function mapDateForAPI(x: string): Date;

export function transformDatesForAPI(start: string, end?: undefined): { start: Date, end: undefined };
export function transformDatesForAPI(start: string, end: string): { start: Date, end: Date };
export function transformDatesForAPI(start: string, end?: string | undefined): { start: Date, end: Date | undefined };
export function transformDatesForAPI(start: string, end?: string | undefined): { start: Date, end: Date | undefined } {
    return end !== undefined ? // Ok
        {
            start: mapDateForAPI(start),
            end: mapDateForAPI(end),
        } :
        {
            start: mapDateForAPI(start),
            end: undefined
        };
}

// File: Rocket.Chat/packages/agenda/src/Agenda.ts
type RepeatOptions = object;
type Job = object;
type IJob = { data: object };
class NewAgenda {
    public async _createIntervalJob(interval: string | number, name: string, data: IJob['data'], options: RepeatOptions): Promise<Job> { return undefined as any; }
    private _createIntervalJobs(
        interval: string | number,
        names: string[],
        data: IJob['data'],
        options: RepeatOptions,
    ): Promise<Job[]> | undefined { return undefined; }

    public async newEvery(interval: string | number, name: string[], data: IJob['data'], options: RepeatOptions): Promise<Job[] | undefined>;
    public async newEvery(interval: string | number, name: string, data: IJob['data'], options: RepeatOptions): Promise<Job>;
    public async newEvery(interval: string | number, name: string | string[], data: IJob['data'], options: RepeatOptions): Promise<Job | Job[] | undefined>;
    public async newEvery(interval: string | number, name: string | string[], data: IJob['data'], options: RepeatOptions): Promise<Job | Job[] | undefined> {
        if (typeof name === 'string') {
            return this._createIntervalJob(interval, name, data, options); // Ok
        }

        if (Array.isArray(name)) {
            return this._createIntervalJobs(interval, name, data, options); // Ok
            // Possible bug in original: createIntervalJobs can return undefined, but the original overload did not acount for that.
        }

        throw new Error('Unexpected error: Invalid job name(s)');
    }
}

// File: angular/packages/common/src/pipes/case_conversion_pipes.ts

function transform1(value: null | undefined): null;
function transform1(value: string): string;
function transform1(value: string | null | undefined): string | null;
function transform1(value: string | null | undefined): string | null {
    if (value == null) return null; // Ok
    if (typeof value !== 'string') {
        throw new Error();
    }
    return value.toLowerCase(); // Ok
}