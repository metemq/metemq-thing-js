import { Thing } from './Thing';
import { parseCSV } from './utils';

/**
 * Options for MQTT subscription for a topic
 */
export interface SubscribeTopicOptions {
    collection?: string;
    documentId?: string;
    field?: string;
    event?: string;
    payload?: string;
}

/**
 * Class for DDMQ Subscription
 *
 * member methods:
 *   onadded (func :Function)
 *   onchanged (func :Function)
 *   onremoved (func :Function)
 *   onEvent (ev :string, func :Function)
 */
export class Subscription {

    constructor(
        private thing: Thing,
        private publishName: string
    ) {

    }

    /**
     * Listener for Added event
     * @param {Function} func
     * @return Subscription
     */
    onAdded(func: Function): Subscription {
        this.onEvent('$added', func);
        return this;
    }


    /**
     * Listener for Changed event
     * @param {Function} func
     * @return Subscription
     */
    onChanged(func: Function): Subscription {
        this.onEvent('$changed', func);
        return this;
    }

    /**
     * Listener for Removed event
     * @param {Function} func
     * @return Subscription
     */
    onRemoved(func: Function): Subscription {
        this.onEvent('$removed', func);
        return this;
    }

    /**
     * Listener for event
     * @param {string} ev
     * @param {Function} func
     * @return Subscription
     */
    onEvent(ev: string, func: Function): Subscription {
        this.thing.on('message', (topic, messageBuf) => {
            let msg = messageBuf.toString();
            let topicSplit = topic.split('/');

            if ((topicSplit[1] === this.publishName || this.publishName === '+')
                && (topicSplit[2] === ev || topicSplit[2] === '+')) {

                let args = parseCSV(msg);
                func(...args);
            }
        });
        return this;
    }

    /**
     * Listener for ANY event
     * @param {Function} function
     * @return Subscription
     */
    onAny(func: Function): Subscription {
        this.thing.on('message', (topic, messageBuf) => {
            let msg = messageBuf.toString();
            let topicSplit = topic.split('/');

            if (topicSplit[1] === this.publishName
                || this.publishName === '+') {

                let args = parseCSV(msg);
                func(...args);
            }
        });
        return this;
    }
}
