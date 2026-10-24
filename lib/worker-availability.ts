import prisma from "@/lib/prisma";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
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

const formatHour = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:00 ${suffix}`;
};

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

// Returns a reason string if the worker cannot take the booking, otherwise null.
function getConflict(booking: BookingSlot, availability: AvailabilityRow[], assignments: AssignmentRow[]) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const day = DAYS[start.getDay()];

    let hours: { start: number; end: number } | null;
    if (availability.length === 0) {
        hours = DEFAULT_HOURS[day];
    } else {
        // A missing row or a zero-length window (startTime === endTime) means a day off
        const row = availability.find((a) => a.day === day);
        const rowStart = row ? new Date(row.startTime).getHours() : 0;
        const rowEnd = row ? new Date(row.endTime).getHours() : 0;
        hours = row && rowEnd > rowStart ? { start: rowStart, end: rowEnd } : null;
    }

    if (!hours) {
        return `Not working on ${DAY_LABELS[day]}`;
    }

    const sameDay = start.toDateString() === end.toDateString();
    if (!sameDay || minutesOfDay(start) < hours.start * 60 || minutesOfDay(end) > hours.end * 60) {
        return `Works ${formatHour(hours.start)} - ${formatHour(hours.end)} on ${DAY_LABELS[day]}`;
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
