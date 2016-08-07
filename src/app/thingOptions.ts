export interface ThingOptions {
    username?: string;
    password?: string;
    url?: string;
}

export const DEFAULT_THING_OPTIONS: ThingOptions = {
    username: undefined,
    password: undefined,
    url: 'mqtt://localhost'
}
