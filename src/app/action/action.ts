import { Thing } from '../Thing';
import { Message } from './message';

/**
 * Action
 */
export class Action {

  private actionFunction: Function;

  constructor(
      private actionName: string,
      private thing: Thing
  ) {
    this.actionFunction = ()=>null;
  }

  set(updateFunction: Function) {
    this.actionFunction = updateFunction;
  }

  unset() {
    this.actionFunction = ()=>null;
  }

  getActionName(): string{
    return this.actionName;
  }

  setActionName(name): string{
    this.actionName = name;
    return this.actionName;
  }

  getActionFunction(): Function {
    return this.actionFunction;
  }

  doAction(msg, ...args) {
    this.actionFunction(msg.controller, args);
  }
}

/**
 * ActionManager
 * submit new actions and call them by actionName
 */
export class ActionManager {

  actions: Array<Action>;
  messages: Array<Message>;

  constructor(
      public thing: Thing
  ) {
    this.actions = [];
    this.messages = [];
  }

  submitAction(actionName: string, actionFunction?: Function): Action {
    let newAction = new Action(actionName, this.thing);

    if (actionFunction) newAction.set(actionFunction);

    this.actions.push( newAction );
    return newAction;
  }

  actionCall (actionName, msgId, ...args) {

    let progress = 0;
    let i = 0;

    let msg = new Message(msgId, this);

    // /metemq/pending
    // param: msgId, thingId, progress
    // return 'reject' or 'done'
    if (this.messages[msgId]) {
      msg.rejected();
    }
    this.messages[msgId] = msg;

    // do action
    for (i = 0; i < this.actions.length; i++) {
        if ( this.actions[i].getActionName === actionName ) {
            msg.pending();
            this.actions[i].doAction(msg, args);
            break;
        }
    }

    // not submited action
    if (i >= this.actions.length)
      msg.rejected();
  }
}
