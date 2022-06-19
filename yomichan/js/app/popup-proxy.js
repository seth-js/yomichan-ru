/*
 * Copyright (C) 2019-2022  Yomichan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * This class is a proxy for a Popup that is hosted in a different frame.
 * It effectively forwards all API calls to the underlying Popup.
 */
class PopupProxy extends EventDispatcher {
    /**
     * Creates a new instance.
     * @param {object} details
     * @param {string} details.id The ID of the popup.
     * @param {number} details.depth The depth of the popup.
     * @param {number} details.frameId The ID of the host frame.
     * @param {FrameOffsetForwarder} details.frameOffsetForwarder A `FrameOffsetForwarder` instance which is used to determine frame positioning.
     */
    constructor({
        id,
        depth,
        frameId,
        frameOffsetForwarder
    }) {
        super();
        this._id = id;
        this._depth = depth;
        this._frameId = frameId;
        this._frameOffsetForwarder = frameOffsetForwarder;

        this._frameOffset = [0, 0];
        this._frameOffsetPromise = null;
        this._frameOffsetUpdatedAt = null;
        this._frameOffsetExpireTimeout = 1000;
    }

    /**
     * The ID of the popup.
     * @type {string}
     */
    get id() {
        return this._id;
    }

    /**
     * The parent of the popup, which is always `null` for `PopupProxy` instances,
     * since any potential parent popups are in a different frame.
     * @type {Popup}
     */
    get parent() {
        return null;
    }

    /**
     * Attempts to set the parent popup.
     * @param {Popup} value
     * @throws Throws an error, since this class doesn't support a direct parent.
     */
    set parent(value) {
        throw new Error('Not supported on PopupProxy');
    }

    /**
     * The popup child popup, which is always null for `PopupProxy` instances,
     * since any potential child popups are in a different frame.
     * @type {Popup}
     */
    get child() {
        return null;
    }

    /**
     * Attempts to set the child popup.
     * @param {Popup} value
     * @throws Throws an error, since this class doesn't support children.
     */
    set child(value) {
        throw new Error('Not supported on PopupProxy');
    }

    /**
     * The depth of the popup.
     * @type {numer}
     */
    get depth() {
        return this._depth;
    }

    /**
     * Gets the content window of the frame. This value is null,
     * since the window is hosted in a different frame.
     * @type {Window}
     */
    get frameContentWindow() {
        return null;
    }

    /**
     * Gets the DOM node that contains the frame.
     * @type {Element}
     */
    get container() {
        return null;
    }

    /**
     * Gets the ID of the frame.
     * @type {number}
     */
    get frameId() {
        return this._frameId;
    }

    /**
     * Sets the options context for the popup.
     * @param {object} optionsContext The options context object.
     * @returns {Promise<void>}
     */
    setOptionsContext(optionsContext) {
        return this._invokeSafe('PopupFactory.setOptionsContext', {id: this._id, optionsContext});
    }

    /**
     * Hides the popup.
     * @param {boolean} changeFocus Whether or not the parent popup or host frame should be focused.
     * @returns {Promise<void>}
     */
    hide(changeFocus) {
        return this._invokeSafe('PopupFactory.hide', {id: this._id, changeFocus});
    }

    /**
     * Returns whether or not the popup is currently visible.
     * @returns {Promise<boolean>} `true` if the popup is visible, `false` otherwise.
     */
    isVisible() {
        return this._invokeSafe('PopupFactory.isVisible', {id: this._id}, false);
    }

    /**
     * Force assigns the visibility of the popup.
     * @param {boolean} value Whether or not the popup should be visible.
     * @param {number} priority The priority of the override.
     * @returns {Promise<string?>} A token used which can be passed to `clearVisibleOverride`,
     *   or null if the override wasn't assigned.
     */
    setVisibleOverride(value, priority) {
        return this._invokeSafe('PopupFactory.setVisibleOverride', {id: this._id, value, priority}, null);
    }

    /**
     * Clears a visibility override that was generated by `setVisibleOverride`.
     * @param {string} token The token returned from `setVisibleOverride`.
     * @returns {Promise<boolean>} `true` if the override existed and was removed, `false` otherwise.
     */
    clearVisibleOverride(token) {
        return this._invokeSafe('PopupFactory.clearVisibleOverride', {id: this._id, token}, false);
    }

    /**
     * Checks whether a point is contained within the popup's rect.
     * @param {number} x The x coordinate.
     * @param {number} y The y coordinate.
     * @returns {Promise<boolean>} `true` if the point is contained within the popup's rect, `false` otherwise.
     */
    async containsPoint(x, y) {
        if (this._frameOffsetForwarder !== null) {
            await this._updateFrameOffset();
            [x, y] = this._applyFrameOffset(x, y);
        }
        return await this._invokeSafe('PopupFactory.containsPoint', {id: this._id, x, y}, false);
    }

    /**
     * Shows and updates the positioning and content of the popup.
     * @param {{optionsContext: object, elementRect: {x: number, y: number, width: number, height: number}, writingMode: string}} details Settings for the outer popup.
     * @param {object} displayDetails The details parameter passed to `Display.setContent`; see that function for details.
     * @returns {Promise<void>}
     */
    async showContent(details, displayDetails) {
        const {elementRect} = details;
        if (typeof elementRect !== 'undefined' && this._frameOffsetForwarder !== null) {
            await this._updateFrameOffset();
            [elementRect.x, elementRect.y] = this._applyFrameOffset(elementRect.x, elementRect.y);
        }
        return await this._invokeSafe('PopupFactory.showContent', {id: this._id, details, displayDetails});
    }

    /**
     * Sets the custom styles for the popup content.
     * @param {string} css The CSS rules.
     * @returns {Promise<void>}
     */
    setCustomCss(css) {
        return this._invokeSafe('PopupFactory.setCustomCss', {id: this._id, css});
    }

    /**
     * Stops the audio auto-play timer, if one has started.
     * @returns {Promise<void>}
     */
    clearAutoPlayTimer() {
        return this._invokeSafe('PopupFactory.clearAutoPlayTimer', {id: this._id});
    }

    /**
     * Sets the scaling factor of the popup content.
     * @param {number} scale The scaling factor.
     * @returns {Promise<void>}
     */
    setContentScale(scale) {
        return this._invokeSafe('PopupFactory.setContentScale', {id: this._id, scale});
    }

    /**
     * Returns whether or not the popup is currently visible, synchronously.
     * @returns {boolean} `true` if the popup is visible, `false` otherwise.
     * @throws An exception is thrown for `PopupProxy` since it cannot synchronously detect visibility.
     */
    isVisibleSync() {
        throw new Error('Not supported on PopupProxy');
    }

    /**
     * Updates the outer theme of the popup.
     * @returns {Promise<void>}
     */
    updateTheme() {
        return this._invokeSafe('PopupFactory.updateTheme', {id: this._id});
    }

    /**
     * Sets the custom styles for the outer popup container.
     * @param {string} css The CSS rules.
     * @param {boolean} useWebExtensionApi Whether or not web extension APIs should be used to inject the rules.
     *   When web extension APIs are used, a DOM node is not generated, making it harder to detect the changes.
     * @returns {Promise<void>}
     */
    setCustomOuterCss(css, useWebExtensionApi) {
        return this._invokeSafe('PopupFactory.setCustomOuterCss', {id: this._id, css, useWebExtensionApi});
    }

    /**
     * Gets the rectangle of the DOM frame, synchronously.
     * @returns {{x: number, y: number, width: number, height: number, valid: boolean}} The rect.
     *   `valid` is `false` for `PopupProxy`, since the DOM node is hosted in a different frame.
     */
    getFrameRect() {
        return {x: 0, y: 0, width: 0, height: 0, valid: false};
    }

    /**
     * Gets the size of the DOM frame.
     * @returns {Promise<{width: number, height: number, valid: boolean}>} The size and whether or not it is valid.
     */
    getFrameSize() {
        return this._invokeSafe('PopupFactory.getFrameSize', {id: this._id}, {width: 0, height: 0, valid: false});
    }

    /**
     * Sets the size of the DOM frame.
     * @param {number} width The desired width of the popup.
     * @param {number} height The desired height of the popup.
     * @returns {Promise<boolean>} `true` if the size assignment was successful, `false` otherwise.
     */
    setFrameSize(width, height) {
        return this._invokeSafe('PopupFactory.setFrameSize', {id: this._id, width, height});
    }

    // Private

    _invoke(action, params={}) {
        return yomichan.crossFrame.invoke(this._frameId, action, params);
    }

    async _invokeSafe(action, params={}, defaultReturnValue) {
        try {
            return await this._invoke(action, params);
        } catch (e) {
            if (!yomichan.isExtensionUnloaded) { throw e; }
            return defaultReturnValue;
        }
    }

    async _updateFrameOffset() {
        const now = Date.now();
        const firstRun = this._frameOffsetUpdatedAt === null;
        const expired = firstRun || this._frameOffsetUpdatedAt < now - this._frameOffsetExpireTimeout;
        if (this._frameOffsetPromise === null && !expired) { return; }

        if (this._frameOffsetPromise !== null) {
            if (firstRun) {
                await this._frameOffsetPromise;
            }
            return;
        }

        const promise = this._updateFrameOffsetInner(now);
        if (firstRun) {
            await promise;
        }
    }

    async _updateFrameOffsetInner(now) {
        this._frameOffsetPromise = this._frameOffsetForwarder.getOffset();
        try {
            const offset = await this._frameOffsetPromise;
            this._frameOffset = offset !== null ? offset : [0, 0];
            if (offset === null) {
                this.trigger('offsetNotFound');
                return;
            }
            this._frameOffsetUpdatedAt = now;
        } catch (e) {
            log.error(e);
        } finally {
            this._frameOffsetPromise = null;
        }
    }

    _applyFrameOffset(x, y) {
        const [offsetX, offsetY] = this._frameOffset;
        return [x + offsetX, y + offsetY];
    }
}