import { Thing } from '../Thing';
import { ActionManager } from './action';

/**
 * Message
 */
export class Message {

    thing: Thing;
    controller: MessageController;

    constructor(
        public msgId: string,
        public actionManager: ActionManager
    ) {
        this.thing = actionManager.thing;
        this.controller = new MessageController(this);
    }

    pending(percentage?) {
        percentage = percentage || 0;
        this.specialMethod("pending", this.msgId, percentage);
    }

    applied(result: any[]) {
        this.specialMethod.apply(this, ['applied', this.msgId].concat(result));
        delete this.actionManager.messages[this.msgId];
    }

    rejected() {
        this.specialMethod("rejected", this.msgId);
        delete this.actionManager.messages[this.msgId];
    }

    private specialMethod(state, ...args) {
        const method = `_metemq_${state}`;
        this.thing.call.apply(this.thing, [method].concat(args));
    }
}

/**
 * MessageController
 */
export class MessageController {

    private inProgress: boolean;

    constructor(
        public message: Message
    ) {
        this.inProgress = true;
    }

    done(...result: any[]) {
        if (this.inProgress) {
            this.inProgress = false;
            this.message.applied(result);
        } else throw new Error('You cannot call done() twice');
    }

    progress(percentage: number) {
        if (!this.inProgress) throw new Error('This action is already done');
        if (percentage >= 100) throw new Error('Percentage should be between 0 and 100');
        this.message.pending(percentage);
    }
}
