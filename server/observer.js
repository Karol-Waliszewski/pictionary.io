'use strict';

module.exports = (object, onChange) => {
    const handler = {
        get(target, property, receiver) {

            const desc = Object.getOwnPropertyDescriptor(target, property)
            const value = Reflect.get(target, property, receiver)

            if (desc && !desc.writable && !desc.configurable) return value

            try {
                return new Proxy(target[property], handler);
            } catch (err) {
                return Reflect.get(target, property, receiver);
            }
        },
        defineProperty(target, property, descriptor) {
            onChange();
            return Reflect.defineProperty(target, property, descriptor);
        },
        deleteProperty(target, property) {
            onChange();
            return Reflect.deleteProperty(target, property);
        }
    };

    return new Proxy(object, handler);
};