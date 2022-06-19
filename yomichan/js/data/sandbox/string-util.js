/*
 * Copyright (C) 2021-2022  Yomichan Authors
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
 * Class containing generic string utility functions.
 */
class StringUtil {
    /**
     * Decodes the contents of an ArrayBuffer using UTF8.
     * @param arrayBuffer The input ArrayBuffer.
     * @returns A UTF8-decoded string.
     */
    static arrayBufferUtf8Decode(arrayBuffer) {
        try {
            return new TextDecoder('utf-8').decode(arrayBuffer);
        } catch (e) {
            return decodeURIComponent(escape(this.arrayBufferToBinaryString(arrayBuffer)));
        }
    }

    /**
     * Converts the contents of an ArrayBuffer to a base64 string.
     * @param arrayBuffer The input ArrayBuffer.
     * @returns A base64 string representing the binary content.
     */
    static arrayBufferToBase64(arrayBuffer) {
        return btoa(this.arrayBufferToBinaryString(arrayBuffer));
    }

    /**
     * Converts the contents of an ArrayBuffer to a binary string.
     * @param arrayBuffer The input ArrayBuffer.
     * @returns A string representing the binary content.
     */
    static arrayBufferToBinaryString(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        try {
            return String.fromCharCode(...bytes);
        } catch (e) {
            let binary = '';
            for (let i = 0, ii = bytes.byteLength; i < ii; ++i) {
                binary += String.fromCharCode(bytes[i]);
            }
            return binary;
        }
    }

    /**
     * Converts a base64 string to an ArrayBuffer.
     * @param content The binary content string encoded in base64.
     * @returns A new `ArrayBuffer` object corresponding to the specified content.
     */
    static base64ToArrayBuffer(content) {
        const binaryContent = atob(content);
        const length = binaryContent.length;
        const array = new Uint8Array(length);
        for (let i = 0; i < length; ++i) {
            array[i] = binaryContent.charCodeAt(i);
        }
        return array.buffer;
    }
}
