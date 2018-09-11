import nextTick from './nextTick.js';

const _rcKey = Symbol('ReferenceCountKey');

/**
 * Base class for all JS objects that are part of this framework.
 *
 * @class IObject
 */
export class IObject {
    /**
     * Utility function that returns an auto released instance of the class the method is called from.
     *
     * @method instance
     * @param {...*} varArgs - The arguments to be forwarded to the class' constructor.
     * @returns {*}
     */
    static instance(...varArgs) {
        return new this(...varArgs).autorelease();
    }

    /**
     * @constructor
     */
    constructor() {
        /* every object is allocated with a retain count of 1 */
        this[_rcKey] = 1;
    }

    /**
     * @method destroy
     */
    destroy() {
        this[_rcKey] = 0;
    }

    /**
     * The current retain count of this object.
     *
     * @type {Number}
     */
    get retainCount() {
        return this[_rcKey];
    }

    /**
     * @method retain
     * @returns {*}
     */
    retain() {
        if (this[_rcKey] <= 0) {
            throw new Error('IObject: Reference count under or equal to zero, are you trying to revive a zombie?');
        }
        ++this[_rcKey];
        return this;
    }

    /**
     * @method release
     * @returns {*}
     */
    release() {
        if (--this[_rcKey] === 0) {
            this.destroy();
        } else if (this[_rcKey] < 0) {
            throw new Error('IObject: Reference count under zero, are you retaining your object?');
        }
        return this;
    }

    /**
     * @method autorelease
     * @returns {*}
     */
    autorelease() {
        nextTick(() => {
            this.release();
        });
        return this;
    }
}

export default IObject;
