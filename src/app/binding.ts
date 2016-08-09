import { Thing } from './Thing';
import { mkString } from './utils';

export class Binding {

    constructor(
        private field: string,
        private setFunction: Function,
        private thing: Thing
    ) {

    }

    update(...args) {
        args.push(this.sendBindMsg);
        const value = this.setFunction.apply(this, args);

        if (value != undefined)
            this.sendBindMsg(value);
    }

    private sendBindMsg(value) {
        this.thing.mqttClient.publish(`${this.thing.id}/$bind/${this.field}`, mkString(value));
    }
}
