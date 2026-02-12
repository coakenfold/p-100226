/** Format an ISO date string for display (e.g. "Jan 15, 2024") */
export function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
/** Basic email format validation */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/** Clamp a number to a min/max range */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/** Truncate a string to maxLength, appending "..." if truncated */
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return `${str.slice(0, maxLength - 3)}...`;
}
//# sourceMappingURL=index.js.map