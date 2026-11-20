const { createWorker } = require('tesseract.js');
const sharp = require('sharp');

const DAY_NAMES = {
    mon: 'Monday',
    monday: 'Monday',
    tue: 'Tuesday',
    tues: 'Tuesday',
    tuesday: 'Tuesday',
    wed: 'Wednesday',
    wednesday: 'Wednesday',
    thu: 'Thursday',
    thurs: 'Thursday',
    thursday: 'Thursday',
    fri: 'Friday',
    friday: 'Friday',
    sat: 'Saturday',
    saturday: 'Saturday',
    sun: 'Sunday',
    sunday: 'Sunday'
};

// SLIIT timetable module codes are primarily ITxxxx. Restrict matching to this
// format so OCR text such as "G1101" or "ITPM1201" is not treated as a module.
// The broad character set absorbs common OCR substitutions in the 4-digit suffix.
const MODULE_REGEX = /(?:^|\s)(IT\s?[0-9OIL!]{4})\s*[-–—:]?\s*(.*)/i;
const GROUP_REGEX = /\bY\d+\.[S5]\d+\.[A-Z0-9.]+\b/ig;
const VENUE_REGEX = /\b([A-Z]\d{3,4}|Online)\b/i;

const normalizeTime = (hour, minute) => (
    `${String(Number(hour)).padStart(2, '0')}:${String(Number(minute)).padStart(2, '0')}`
);

const addHours = (time, hours) => {
    const [hour, minute] = time.split(':').map(Number);
    return normalizeTime((hour + hours) % 24, minute);
};

// [T3010 -> IT3010 බවට නිවැරදි කිරීම
const cleanModuleCode = (raw) => {
    let code = raw.replace(/\s+/g, '').toUpperCase();
    code = code.replace(/^IIT/, 'IT');
    code = 'IT' + code.slice(2)
        .replace(/[O|!]/g, '0')
        .replace(/[I[\]|!]/g, '1');
    return code;
};

const getType = (text) => {
    const value = text.toLowerCase();
    const hasLec = value.includes('lecture');
    const hasTut = value.includes('tutorial');
    const hasPrac = value.includes('practical') || value.includes('lab');

    if (hasLec && hasTut) return 'Tutorial';
    if (hasPrac) return 'Practical';
    if (hasTut) return 'Tutorial';
    if (hasLec) return 'Lecture';
    if (value.includes('seminar')) return 'Tutorial';
    return 'Lecture';
};

const extractWordsFromResult = (data) => {
    if (Array.isArray(data.words) && data.words.length > 0) return data.words;
    const words = [];
    if (Array.isArray(data.blocks)) {
        for (const block of data.blocks) {
            for (const para of block.paragraphs || []) {
                for (const line of para.lines || []) {
                    for (const word of line.words || []) {
                        words.push(word);
                    }
                }
            }
        }
    }
    return words;
};

// නිශ්චිත කොටසක් (Crop) විශාල කර Threshold යොදා පැහැදිලි කිරීම
const cropAndEnhance = async (imageBuffer, rect, scale = 3) => {
    return sharp(imageBuffer)
        .extract(rect)
        .resize({ width: Math.round(rect.width * scale) })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();
};

const parseHeaderInfo = (text, studentInfo = {}) => {
    const match = text.match(/\b(Y\d+)\.[S5](\d+)\.[A-Z]+\.([A-Z]+)(?:\.(\d+))?/i);
    return {
        studentId: studentInfo.studentId || '',
        year: studentInfo.year || (match ? match[1].toUpperCase() : ''),
        semester: studentInfo.semester || (match ? `S${match[2]}` : ''),
        program: studentInfo.program || (match ? match[3].toUpperCase() : ''),
        group: studentInfo.group || (match ? match[0].replace(/\.5(\d)\./i, '.S$1.').toUpperCase() : '')
    };
};

// එක කොටුවක් ඇතුළේ වම්/දකුණු පැතිවල Parallel Sessions (0101 / 0102) ඇත්නම් වෙන් කිරීම
const splitParallelColumns = (cellWords, colWidth) => {
    const groupWords = cellWords.filter((w) => GROUP_REGEX.test(w.text));
    if (groupWords.length >= 2) {
        const sortedGroups = [...groupWords].sort((a, b) => a.bbox.x0 - b.bbox.x0);
        const first = sortedGroups[0];
        const second = sortedGroups.find(
            (g) => Math.abs(g.bbox.y0 - first.bbox.y0) <= 30 && (g.bbox.x0 - first.bbox.x1) > colWidth * 0.12
        );

        if (second) {
            const splitX = (first.bbox.x1 + second.bbox.x0) / 2;
            return [
                cellWords.filter((w) => (w.bbox.x0 + w.bbox.x1) / 2 < splitX),
                cellWords.filter((w) => (w.bbox.x0 + w.bbox.x1) / 2 >= splitX)
            ];
        }
    }
    return [cellWords];
};

const groupWordsIntoLines = (cellWords) => {
    const sorted = [...cellWords].sort((a, b) => a.bbox.y0 - b.bbox.y0);
    const lines = [];

    for (const word of sorted) {
        const y = (word.bbox.y0 + word.bbox.y1) / 2;
        const height = word.bbox.y1 - word.bbox.y0;
        const existingLine = lines.find((line) => Math.abs(line.y - y) <= Math.max(12, height * 0.6));
        if (existingLine) {
            existingLine.words.push(word);
            existingLine.y = (existingLine.y + y) / 2;
        } else {
            lines.push({ y, words: [word] });
        }
    }

    return lines.map((line) =>
        line.words
            .sort((a, b) => a.bbox.x0 - b.bbox.x0)
            .map((w) => w.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
    );
};

const parseBlockLines = (lines, day, time, baseInfo) => {
    const fullText = lines.join(' ');
    if (!fullText || /^[-x*.\s]+$/i.test(fullText)) return null;

    const moduleMatch = fullText.match(MODULE_REGEX);
    if (!moduleMatch) return null;

    const moduleCode = cleanModuleCode(moduleMatch[1]);
    if (!/^IT\d{4}$/.test(moduleCode)) return null;

    const groups = (fullText.match(GROUP_REGEX) || []).map((g) => g.replace(/\.5(\d)\./i, '.S$1.').toUpperCase());
    const groupStr = groups.length > 0 ? groups.join(', ') : baseInfo.group;

    let rawTitle = moduleMatch[2]
        .replace(GROUP_REGEX, '')
        .replace(/\b(Lecture|Tutorial|Practical|BYOD|Seminar|Online)\b/ig, '')
        .replace(/\b(Mr|Ms|Mrs|Dr|Prof)\.?\s+[A-Za-z\s,]+/g, '')
        .replace(VENUE_REGEX, '')
        .replace(/[-–—,]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const lecturerLine = lines.find((l) => /\b(Mr|Ms|Mrs|Dr|Prof)\.?\b/i.test(l)) || '';
    const lecturer = lecturerLine.replace(VENUE_REGEX, '').replace(/\s+/g, ' ').trim();

    const lastLine = lines[lines.length - 1] || '';
    const venueMatch = lastLine.match(VENUE_REGEX) || fullText.match(VENUE_REGEX);
    const venue = venueMatch ? venueMatch[1].toUpperCase() : '';

    return {
        studentId: baseInfo.studentId,
        day,
        moduleCode,
        moduleName: rawTitle || moduleCode,
        type: getType(fullText),
        time,
        endTime: addHours(time, 1),
        group: groupStr,
        venue,
        lecturer,
        year: baseInfo.year,
        semester: baseInfo.semester,
        program: baseInfo.program
    };
};

const mergeConsecutiveSessions = (entries) => {
    const sorted = [...entries].sort((a, b) => {
        if (a.day !== b.day) return a.day.localeCompare(b.day);
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        return a.time.localeCompare(b.time);
    });

    const merged = [];
    for (const current of sorted) {
        const prev = merged[merged.length - 1];
        if (
            prev &&
            prev.day === current.day &&
            prev.moduleCode === current.moduleCode &&
            prev.type === current.type &&
            prev.group === current.group &&
            prev.endTime === current.time
        ) {
            prev.endTime = current.endTime;
        } else {
            merged.push({ ...current });
        }
    }
    return merged;
};

const extractTimetableFromImage = async (filePath, studentInfo = {}) => {
    const worker = await createWorker('eng');

    try {
        const originalBuffer = await sharp(filePath).toBuffer();
        const meta = await sharp(originalBuffer).metadata();
        const width = meta.width;
        const height = meta.height;

        // 1. උඩ කොටස (Header + Day Names) වෙනම 4x විශාල කර කියවීම
        const headerCropHeight = Math.round(height * 0.18);
        const headerScale = 4;
        const headerBuffer = await cropAndEnhance(
            originalBuffer,
            { left: 0, top: 0, width, height: headerCropHeight },
            headerScale
        );
        const headerRes = await worker.recognize(headerBuffer, {}, { blocks: true });
        const headerWords = extractWordsFromResult(headerRes.data);
        const baseInfo = parseHeaderInfo(headerRes.data.text || '', studentInfo);

        // Day headers හඳුනාගැනීම (Original coordinates වලට හරවා)
        let dayColumns = headerWords
            .map((w) => {
                const clean = String(w.text || '').toLowerCase().replace(/[^a-z]/g, '');
                return DAY_NAMES[clean] ? {
                    day: DAY_NAMES[clean],
                    x: ((w.bbox.x0 + w.bbox.x1) / 2) / headerScale,
                    y: ((w.bbox.y0 + w.bbox.y1) / 2) / headerScale
                } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.x - b.x)
            .filter((col, idx, arr) => idx === 0 || col.day !== arr[idx - 1].day);

        // සමහර දවස් OCR නොවුණොත් (උදා: Monday සහ Wednesday විතරක් අහුවුණොත්) ඉතිරි දවස් සමාන පරතරයකින් ගණනය කිරීම
        const ALL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        if (dayColumns.length >= 2 && dayColumns.length < 5) {
            const firstIdx = ALL_WEEKDAYS.indexOf(dayColumns[0].day);
            const lastIdx = ALL_WEEKDAYS.indexOf(dayColumns[dayColumns.length - 1].day);
            if (firstIdx !== -1 && lastIdx > firstIdx) {
                const stepX = (dayColumns[dayColumns.length - 1].x - dayColumns[0].x) / (lastIdx - firstIdx);
                const startX = dayColumns[0].x - firstIdx * stepX;
                const avgY = dayColumns[0].y;
                dayColumns = ALL_WEEKDAYS.map((day, idx) => ({
                    day,
                    x: startX + idx * stepX,
                    y: avgY
                }));
            }
        }

        if (dayColumns.length === 0) {
            console.warn('[OCR Debug] Could not detect day columns.');
            return [];
        }

        const headerBottomY = Math.round(dayColumns[0].y + 10);

        // 2. වම් පැත්තේ Time Column එක විතරක් වෙනම Crop කර 4x විශාල කර කියවීම
        const timeColWidth = Math.max(40, Math.round(dayColumns[0].x - (dayColumns[1]?.x - dayColumns[0].x) * 0.45));
        const timeScale = 4;
        const timeBuffer = await cropAndEnhance(
            originalBuffer,
            { left: 0, top: headerBottomY, width: timeColWidth, height: height - headerBottomY },
            timeScale
        );
        const timeRes = await worker.recognize(timeBuffer, {}, { blocks: true });
        const timeWords = extractWordsFromResult(timeRes.data);

        let timeRows = timeWords
            .map((w) => {
                // 08:30, 8:30, 08.30, 0830 වැනි format අල්ලගැනීම
                const raw = String(w.text || '').trim().replace(/[^0-9:.]/g, '');
                const match = raw.match(/^(\d{1,2})[:.]?(\d{2})$/);
                if (!match) return null;
                const hour = Number(match[1]);
                const min = Number(match[2]);
                if (hour >= 7 && hour <= 20 && (min === 0 || min === 30)) {
                    return {
                        time: normalizeTime(hour, min),
                        y: headerBottomY + (((w.bbox.y0 + w.bbox.y1) / 2) / timeScale)
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.y - b.y)
            .filter((row, idx, arr) => idx === 0 || row.time !== arr[idx - 1].time);

        // Fallback: වම් තීරුවේ වෙලාවල් කිහිපයක් විතරක් අහුවුණොත් SLIIT standard slots (08:30 - 16:30) interpolate කිරීම
        if (timeRows.length < 3) {
            const tableHeight = height * 0.92 - headerBottomY;
            const slotHeight = tableHeight / 9;
            const standardTimes = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30'];
            timeRows = standardTimes.map((t, idx) => ({
                time: t,
                y: headerBottomY + slotHeight * (idx + 0.5)
            }));
        }

        // Column සහ Row Boundaries සෑදීම
        const colWidth = dayColumns.length > 1 ? dayColumns[1].x - dayColumns[0].x : (width - timeColWidth) / 5;
        const colBounds = dayColumns.map((col, idx) => ({
            day: col.day,
            left: idx === 0 ? timeColWidth : (dayColumns[idx - 1].x + col.x) / 2,
            right: idx === dayColumns.length - 1 ? width : (col.x + dayColumns[idx + 1].x) / 2
        }));

        const avgRowHeight = (timeRows[timeRows.length - 1].y - timeRows[0].y) / Math.max(1, timeRows.length - 1);
        const rowBounds = timeRows.map((row, idx) => ({
            time: row.time,
            top: idx === 0 ? headerBottomY : (timeRows[idx - 1].y + row.y) / 2,
            bottom: idx === timeRows.length - 1 ? Math.min(height, row.y + avgRowHeight * 0.55) : (row.y + timeRows[idx + 1].y) / 2
        }));

        // 3. මුළු Table Body එක 3x විශාල කර OCR කිරීම
        const bodyScale = 3;
        const bodyBuffer = await cropAndEnhance(
            originalBuffer,
            { left: timeColWidth, top: headerBottomY, width: width - timeColWidth, height: height - headerBottomY },
            bodyScale
        );
        const bodyRes = await worker.recognize(bodyBuffer, {}, { blocks: true });
        const bodyWords = extractWordsFromResult(bodyRes.data);

        const cells = new Map();
        for (const w of bodyWords) {
            const text = String(w.text || '').trim();
            if (!text) continue;

            // Original coordinates වලට නැවත හැරවීම
            const x0 = timeColWidth + w.bbox.x0 / bodyScale;
            const x1 = timeColWidth + w.bbox.x1 / bodyScale;
            const y0 = headerBottomY + w.bbox.y0 / bodyScale;
            const y1 = headerBottomY + w.bbox.y1 / bodyScale;
            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;

            const col = colBounds.find((c) => cx >= c.left && cx < c.right);
            const row = rowBounds.find((r) => cy >= r.top && cy < r.bottom);
            if (!col || !row) continue;

            const key = `${col.day}|${row.time}`;
            if (!cells.has(key)) {
                cells.set(key, { day: col.day, time: row.time, words: [] });
            }
            cells.get(key).words.push({
                text,
                bbox: { x0: w.bbox.x0, x1: w.bbox.x1, y0: w.bbox.y0, y1: w.bbox.y1 }
            });
        }

        const rawEntries = [];
        for (const cell of cells.values()) {
            const subColumns = splitParallelColumns(cell.words, colWidth * bodyScale);
            for (const subWords of subColumns) {
                const lines = groupWordsIntoLines(subWords);
                const parsed = parseBlockLines(lines, cell.day, cell.time, baseInfo);
                if (parsed) rawEntries.push(parsed);
            }
        }

        return mergeConsecutiveSessions(rawEntries);
    } finally {
        await worker.terminate();
    }
};

module.exports = { extractTimetableFromImage, getType };