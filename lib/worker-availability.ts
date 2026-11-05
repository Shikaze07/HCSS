import prisma from "@/lib/prisma";

// Bookings are compared against worker hours in the business's local time,
// so results don't depend on the server's or the browser's timezone.
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "Asia/Manila";

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const DAY_LABELS: Record<string, string> = {
    SUN: "Sunday",
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
};

// Same defaults the worker sees on Schedule Management before saving any availability
const DEFAULT_HOURS: Record<string, { start: number; end: number } | null> = {
    MON: { start: 8, end: 17 },
    TUE: { start: 8, end: 17 },
    WED: { start: 8, end: 17 },
    THU: { start: 8, end: 17 },
    FRI: { start: 8, end: 17 },
    SAT: null,
    SUN: null,
};

type BookingSlot = { id: string; startTime: Date; endTime: Date };
type AvailabilityRow = { day: string; startTime: Date; endTime: Date };
type AssignmentRow = { booking: BookingSlot };

// Availability hours are stored as UTC clock times on 1970-01-01 (08:00 = 8 AM);
// an end of 24 (midnight) is stored as 00:00 on 1970-01-02, so hours read back as 0-24.
export const availabilityTime = (hour: number) => new Date(Date.UTC(1970, 0, 1, hour, 0));
export const availabilityHour = (d: Date) => Math.round(new Date(d).getTime() / 3600000);

const formatHour = (h: number) => {
    const suffix = h % 24 >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:00 ${suffix}`;
};

// Day, date and minutes-since-midnight of a timestamp in the business timezone
function localParts(d: Date) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone: BUSINESS_TIMEZONE,
            weekday: "short",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        })
            .formatToParts(d)
            .map((p) => [p.type, p.value])
    );
    return {
        day: parts.weekday.toUpperCase().slice(0, 3),
        date: `${parts.year}-${parts.month}-${parts.day}`,
        minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
}

// Returns a reason string if the worker cannot take the booking, otherwise null.
function getConflict(booking: BookingSlot, availability: AvailabilityRow[], assignments: AssignmentRow[]) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const s = localParts(start);
    const e = localParts(end);

    // Working hours for a given day, or null if the worker is off that day
    const hoursFor = (day: string): { start: number; end: number } | null => {
        if (availability.length === 0) return DEFAULT_HOURS[day];
        // A missing row or a zero-length window (startTime === endTime) means a day off
        const row = availability.find((a) => a.day === day);
        const rowStart = row ? availabilityHour(row.startTime) : 0;
        const rowEnd = row ? availabilityHour(row.endTime) : 0;
        return row && rowEnd > rowStart ? { start: rowStart, end: rowEnd } : null;
    };

    const hours = hoursFor(s.day);
    if (!hours) {
        return `Not working on ${DAY_LABELS[s.day]}`;
    }

    const worksMessage = `Works ${formatHour(hours.start)} - ${formatHour(hours.end)} on ${DAY_LABELS[s.day]}`;

    if (s.date === e.date) {
        if (s.minutes < hours.start * 60 || e.minutes > hours.end * 60) return worksMessage;
    } else {
        // Booking runs past midnight: the first day must cover until midnight
        // and the next day must cover from midnight until the booking ends.
        const nextDay = DAYS[(DAYS.indexOf(s.day as (typeof DAYS)[number]) + 1) % 7];
        const nextHours = hoursFor(nextDay);
        const spansOneNight = new Date(end).getTime() - start.getTime() < 24 * 3600000;
        if (s.minutes < hours.start * 60 || hours.end < 24) return worksMessage;
        if (!spansOneNight || !nextHours) return `Not working on ${DAY_LABELS[nextDay]}`;
        if (nextHours.start > 0 || e.minutes > nextHours.end * 60) {
            return `Works ${formatHour(nextHours.start)} - ${formatHour(nextHours.end)} on ${DAY_LABELS[nextDay]}`;
        }
    }

    const clash = assignments.find(
        (a) =>
            a.booking.id !== booking.id &&
            new Date(a.booking.startTime) < end &&
            new Date(a.booking.endTime) > start
    );
    if (clash) {
        return "Already has a job at this time";
    }

    return null;
}

const activeAssignmentsWhere = {
    status: { not: "DECLINED" as const },
    booking: { status: { not: "CANCELLED" as const } },
};

export async function checkWorkerAvailability(workerId: string, booking: BookingSlot) {
    const [availability, assignments] = await Promise.all([
        prisma.workerAvailability.findMany({ where: { workerId } }),
        prisma.workerAssignment.findMany({
            where: { workerId, ...activeAssignmentsWhere },
            select: { booking: { select: { id: true, startTime: true, endTime: true } } },
        }),
    ]);
    return getConflict(booking, availability, assignments);
}

// Adds `available` and `unavailableReason` to each worker for the given booking.
export async function annotateWorkersForBooking<T extends { id: string }>(workers: T[], booking: BookingSlot) {
    const workerIds = workers.map((w) => w.id);
    const [availability, assignments] = await Promise.all([
        prisma.workerAvailability.findMany({ where: { workerId: { in: workerIds } } }),
        prisma.workerAssignment.findMany({
            where: { workerId: { in: workerIds }, ...activeAssignmentsWhere },
            select: { workerId: true, booking: { select: { id: true, startTime: true, endTime: true } } },
        }),
    ]);

    return workers.map((w) => {
        const reason = getConflict(
            booking,
            availability.filter((a) => a.workerId === w.id),
            assignments.filter((a) => a.workerId === w.id)
        );
        return { ...w, available: !reason, unavailableReason: reason };
    });
}

// Checks a booking can still be assigned at all (before looking at any worker)
export function getBookingProblem(booking: { status: string; startTime: Date }) {
    if (booking.status === "CANCELLED") return "This booking was cancelled";
    if (booking.status === "COMPLETED") return "This booking is already completed";
    if (new Date(booking.startTime).getTime() < Date.now()) return "This booking's start time has already passed";
    return null;
}
