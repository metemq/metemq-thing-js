declare module "mqtt-emitter" {

    class MqttEmitter {
        on(topicPattern: string, handler: (payload, params) => void): void;
        once(topicPattern: string, handler: (payload, params) => void): void;
        emit(topic: string, payload: any);
    }

    export = MqttEmitter;
}
