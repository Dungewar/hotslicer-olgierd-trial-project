export const timer = {
    start: () => performance.now(),
    /**
     * Calculates the elapsed time since a given start time.
     *
     * @param {number} startTime - The start time in milliseconds, typically obtained from performance.now().
     * @returns {number} The elapsed time in milliseconds from the given start time to the current time.
     */
    end: (startTime: number): number => performance.now() - startTime
};
export function splitIntoMessages(text: string, maxLength: number = 1900): string[] {
    // If text is shorter than maxLength, return it as is
    if (text.length <= maxLength) {
        return [text];
    }

    const messages: string[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
        if (remainingText.length <= maxLength) {
            messages.push(remainingText);
            break;
        }

        // Find the last period within maxLength
        let lastPeriodIndex = remainingText.lastIndexOf('.', maxLength);

        // If no period is found, try other sentence ending punctuation
        if (lastPeriodIndex === -1) {
            lastPeriodIndex = remainingText.lastIndexOf('!', maxLength);
        }
        if (lastPeriodIndex === -1) {
            lastPeriodIndex = remainingText.lastIndexOf('?', maxLength);
        }

        // If still no sentence boundary found, use the last space
        if (lastPeriodIndex === -1) {
            lastPeriodIndex = remainingText.lastIndexOf(' ', maxLength);
        }

        // If no space found, force split at maxLength
        if (lastPeriodIndex === -1) {
            lastPeriodIndex = maxLength;
        }

        // Extract the chunk and trim it
        const chunk = remainingText.substring(0, lastPeriodIndex + 1).trim();
        messages.push(chunk);

        // Update remaining text and trim it
        remainingText = remainingText.substring(lastPeriodIndex + 1).trim();
    }

    return messages;
}
export function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/\n/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
}