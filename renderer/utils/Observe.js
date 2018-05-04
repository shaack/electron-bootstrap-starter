/**
 * Author: https://shaack.com
 */

const collectionMutationMethods = {
    array: ["copyWithin", "fill", "pop", "push", "reverse", "shift", "unshift", "sort", "splice"],
    set: ["add", "clear", "delete"],
    map: ["set", "clear", "delete"]
};

module.exports = class Observe {

    /**
     * Intercept function call, before function is executed. Can manipulate
     * arguments in callback.
     * @param object
     * @param functionName allows multiple names as array
     * @param callback
     * @returns Object with `remove` function to remove the interceptor
     */
    static preFunction(object, functionName, callback) {
        if (Array.isArray(functionName)) {
            let removes = [];
            functionName.forEach((functionNameItem) => {
                removes.push(Observe.preFunction(object, functionNameItem, callback));
            });
            return {
                remove: () => {
                    removes.forEach((remove) => {
                        remove.remove();
                    })
                }
            };
        }
        if (object.observedPreFunctions === undefined) {
            object.observedPreFunctions = {};
        }
        if (object.observedPreFunctions[functionName] === undefined) {
            object.observedPreFunctions[functionName] = new Set();
            const originalMethod = object[functionName];
            object[functionName] = function () {
                let functionArguments = arguments;
                object.observedPreFunctions[functionName].forEach(function (callback) {
                    const params = {functionName: functionName, arguments: functionArguments};
                    const callbackReturn = callback(params);
                    if (callbackReturn) {
                        functionArguments = callbackReturn;
                    }
                });
                return originalMethod.apply(object, functionArguments);
            };
        }
        object.observedPreFunctions[functionName].add(callback);
        return {
            remove: () => {
                object.observedPreFunctions[functionName].delete(callback);
            }
        }
    };

    /**
     * Intercept function call, after function is executed. Can manipulate
     * returnValue in callback.
     * @param object
     * @param functionName allows multiple names as array
     * @param callback
     * @returns Object with `remove` function to remove the interceptor
     */
    static postFunction(object, functionName, callback) {
        if (Array.isArray(functionName)) {
            let removes = [];
            functionName.forEach((functionNameItem) => {
                removes.push(Observe.postFunction(object, functionNameItem, callback));
            });
            return {
                remove: () => {
                    removes.forEach((remove) => {
                        remove.remove();
                    })
                }
            };
        }
        if (object.observedPostFunctions === undefined) {
            object.observedPostFunctions = {};
        }
        if (object.observedPostFunctions[functionName] === undefined) {
            object.observedPostFunctions[functionName] = new Set();
            const originalMethod = object[functionName];
            object[functionName] = function () {
                let returnValue = originalMethod.apply(object, arguments);
                const functionArguments = arguments;
                object.observedPostFunctions[functionName].forEach(function (callback) {
                    const params = {functionName: functionName, arguments: functionArguments, returnValue: returnValue};
                    callback(params);
                    returnValue = params.returnValue; // modifiable if called synced
                });
                return returnValue;
            };
        }
        object.observedPostFunctions[functionName].add(callback);
        return {
            remove: () => {
                object.observedPostFunctions[functionName].delete(callback);
            }
        }
    }

    /**
     * Observe properties, also arrays and other collections.
     * @param object
     * @param propertyName allows multiple names as array
     * @param callback
     */
    static property(object, propertyName, callback) {
        if (Array.isArray(propertyName)) {
            let removes = [];
            propertyName.forEach((propertyNameItem) => {
                removes.push(Observe.property(object, propertyNameItem, callback));
            });
            return {
                remove: () => {
                    removes.forEach((remove) => {
                        remove.remove();
                    })
                }
            };
        }
        let isCollection = false;
        if (object.observedProperties === undefined) {
            object.observedProperties = {};
        }
        if (!object.hasOwnProperty(propertyName)) {
            console.error("Observe.property", object, "missing property: " + propertyName);
        }
        if (object.observedProperties[propertyName] === undefined) {
            object.observedProperties[propertyName] = {
                value: object[propertyName],
                observers: new Set()
            };

            const property = object[propertyName];
            let mutationMethods = null;
            if (property instanceof Array) {
                isCollection = true;
                mutationMethods = collectionMutationMethods.array;
            } else if (property instanceof Set || property instanceof WeakSet) {
                isCollection = true;
                mutationMethods = collectionMutationMethods.set;
            } else if (property instanceof Map || property instanceof WeakMap) {
                isCollection = true;
                mutationMethods = collectionMutationMethods.map;
            }
            if (isCollection) { // handling for Collections
                mutationMethods.forEach(function (methodName) {
                    object[propertyName][methodName] = function () {
                        // object[propertyName].constructor.prototype[methodName] is Array or Set or...
                        object[propertyName].constructor.prototype[methodName].apply(this, arguments);
                        const methodArguments = arguments;
                        object.observedProperties[propertyName].observers.forEach(function (observer) {
                            const params = {
                                propertyName: propertyName,
                                methodName: methodName,
                                arguments: methodArguments,
                                newValue: object[propertyName]
                            };
                            observer(params);
                        });
                    };
                });
            } else if (delete object[propertyName]) { // handling for simple properties
                Object.defineProperty(object, propertyName, {
                    get: function () {
                        return object.observedProperties[propertyName].value;
                    },
                    set: function (newValue) {
                        const oldValue = object.observedProperties[propertyName].value;
                        if (newValue !== oldValue) {
                            object.observedProperties[propertyName].value = newValue;
                            object.observedProperties[propertyName].observers.forEach(function (callback) {
                                const params = {propertyName: propertyName, oldValue: oldValue, newValue: newValue};
                                callback(params);
                            });
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            } else {
                console.error("Error: Observe.property", propertyName, "failed");
            }
        }
        object.observedProperties[propertyName].observers.add(callback);
        return {
            remove: () => {
                object.observedProperties[propertyName].observers.delete(callback);
            }
        }
    }
}
