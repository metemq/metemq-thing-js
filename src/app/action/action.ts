import { Thing } from '../Thing';
import { Message } from './message';

/**
 * Action
 */
export class Action {

    constructor(
        private name: string,
        private action: Function
    ) { }

    run(msg: Message, params: any[]) {
        const args = [msg.controller].concat(params);
        this.action.apply(null, args);
    }
}

/**
 * ActionManager
 * submit new actions and call them by actionName
 */
export class ActionManager {

    actions: { [name: string]: Action } = {};
    messages: { [msgId: string]: Message } = {};

    constructor(
        public thing: Thing
    ) { }

    submitAction(name: string, action: Function): void {
        this.actions[name] = new Action(name, action);
    }

    actionCall(msgId: string, name: string, params: any[]) {
        const progress = 0;
        const msg = new Message(msgId, this);

        // Reject if there is no such action
        if (!this.actions[name]) return msg.rejected();

        // Insert message
        this.messages[msgId] = msg;

        // Send pending message
        msg.pending();

        // Run action
        this.actions[name].run(msg, params);
    }
}
