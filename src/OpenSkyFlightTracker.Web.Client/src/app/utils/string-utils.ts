// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export class StringUtils {
    
    static isNullOrWhitespace(input: string): boolean {
        return !input || !input.trim();
    }

    static localeEquals(a: string, b: string) {
        // Both are null:
        if(!a && !b) {
            return true;
        }

        if(!a && b) {
            return false;
        }

        return a.localeCompare(b) === 0;
    }
}
