// utils/conflictEngine.js

const toMinutes = (t) => {
    if (!t || typeof t !== 'string' || !t.includes(':')) return null;

    const [h, m] = t.split(':').map(Number);

    if (isNaN(h) || isNaN(m)) return null;

    return h * 60 + m;
};

const isOverlap = (a, b) => {
    if (!a || !b) return false;
    if (!a.day || !b.day) return false;
    if (a.day !== b.day) return false;

    const aStart = toMinutes(a.startTime);
    const aEnd = toMinutes(a.endTime);
    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);

    if ([aStart, aEnd, bStart, bEnd].includes(null)) return false;

    return aStart < bEnd && aEnd > bStart;
};

const detectConflicts = (items) => {
    if (!Array.isArray(items)) return [];

    return items.map((item, i) => {
        const conflicts = [];

        for (let j = 0; j < items.length; j++) {
            if (i === j) continue;

            const other = items[j];

            if (isOverlap(item, other)) {
                conflicts.push({
                    type: other.type,
                    title: other.title,
                    day: other.day,
                    startTime: other.startTime,
                    endTime: other.endTime
                });
            }
        }

        return {
            ...item,
            conflicts
        };
    });
};

module.exports = { detectConflicts };