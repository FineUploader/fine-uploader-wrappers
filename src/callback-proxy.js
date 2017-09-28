import objectAssign from 'object-assign'

import { thenable as thenableCallbackNames } from './callback-names'

const privateData = new WeakMap()
const callbacks = new WeakMap()

export default class CallbackProxy {
    constructor(name) {
        callbacks.set(this, [])

        privateData.set(this, {
            name,
            proxyFunction: getProxyFunction.call(this, { name })
        })
    }

    add(callback) {
        callbacks.get(this).push(callback)
    }
    
    get name() {
        return privateData.get(this).name
    }

    get proxyFunction() {
        return privateData.get(this).proxyFunction
    }

    remove(callback) {
        const index = callbacks.get(this).indexOf(callback)
        if (index >= 0) {
            callbacks.get(this).splice(index, 1)
        }
    }
}

const getProxyFunction = function({ name }) {
    const proxyClassContext = this
    
    return (...originalCallbackArguments) => {
        const isThenable = thenableCallbackNames.indexOf(name) >= 0
        const registeredCallbacks = callbacks.get(proxyClassContext)
        let callbackReturnValue

        if (isThenable) {
            callbackReturnValue = executeThenableCallbacks({ registeredCallbacks, originalCallbackArguments })
        }
        else {
            objectAssign([], registeredCallbacks).every(callback => {
                const returnValue = callback.apply(null, originalCallbackArguments)

                callbackReturnValue = returnValue

                return returnValue !== false
            })
        }

        return callbackReturnValue
    }
}

const executeThenableCallbacks = ({ registeredCallbacks, originalCallbackArguments }) => {
    if (registeredCallbacks.length) {
        return executeThenableCallback({
            registeredCallbacks: objectAssign([], registeredCallbacks).reverse(),
            originalCallbackArguments
        })
    }

    return Promise.resolve()
}


const getResultToPass = ({ newResult, previousResult }) => {
    if (newResult !== null && (typeof newResult) === 'object') {
        return objectAssign({}, previousResult || {}, newResult)
    }
    else {
        return newResult || previousResult
    }
}

const executeThenableCallback = ({ registeredCallbacks, originalCallbackArguments, previousResult } ) => {
    return new Promise((resolve, reject) => {
        const callback = registeredCallbacks.pop()

        let returnValue = callback.apply(null, originalCallbackArguments)

        if (returnValue && returnValue.then) {
            returnValue
                .then(result => {
                    const resultToPass = getResultToPass({ newResult: result, previousResult })

                    if (registeredCallbacks.length) {
                        executeThenableCallback({ registeredCallbacks, originalCallbackArguments, previousResult: resultToPass })
                            .then(resolve, reject)
                    }
                    else {
                        resolve(resultToPass)
                    }
                })
                .catch(error => reject(error))
        }
        else if (returnValue === false) {
            reject()
        }
        else {
            const resultToPass = getResultToPass({ newResult: returnValue, previousResult })

            if (registeredCallbacks.length) {
                executeThenableCallback({ registeredCallbacks, originalCallbackArguments, previousResult: resultToPass })
                    .then(resolve, reject)
            }
            else {
                resolve(resultToPass)
            }
        }
    })
}
