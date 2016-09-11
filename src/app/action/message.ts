import { Thing } from '../Thing';
import { ActionManager } from './action';

/**
 * Message
 */
export class Message {

  thing: Thing;
  controller: MessageController;

  constructor(
    public msgId,
    public actionManager: ActionManager
  ) {
    this.thing = actionManager.thing;
    this.controller = new MessageController(this);
  }

  pending(percentage?) {
    if (! this.actionManager.messages[this.msgId]) return;
    
    percentage = percentage || 0;
    this.specialMethod("pending", this.msgId, this.thing.id, percentage);
  }

  applied() {
    if (! this.actionManager.messages[this.msgId]) return;

    this.specialMethod("applied", this.msgId, this.thing.id );
    this.actionManager.messages[this.msgId] = null;
  }

  rejected() {
    if (! this.actionManager.messages[this.msgId]) return;

    this.specialMethod("rejected", this.msgId, this.thing.id );
    this.actionManager.messages[this.msgId] = null;
  }

  private specialMethod(state, ...args) {
    let method = `_metemq_${state}`;
    this.thing.call(method, args);
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

  done() {
    if (this.inProgress) {
      this.inProgress = false;
      this.message.applied();
    }
  }

  progress(percentage: number) {
    if (! this.inProgress) return;
    if (percentage >= 100) return;
    this.message.pending(percentage);
  }
}
