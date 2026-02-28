import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public API to get holidays for booking calendar
 * Returns holidays within a date range (default: next 6 months)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Default to current year if no range specified
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const now = new Date();
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(now.getFullYear(), now.getMonth() + 6, 0);

    // Get one-time holidays within date range
    const oneTimeHolidays = await db.holiday.findMany({
      where: {
        isRecurring: false,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        isRecurring: true,
        description: true,
      },
      orderBy: { date: "asc" },
    });

    // Get recurring holidays (annual)
    const recurringHolidays = await db.holiday.findMany({
      where: {
        isRecurring: true,
      },
      select: {
        id: true,
        name: true,
        date: true,
        isRecurring: true,
        description: true,
      },
    });

    // For recurring holidays, generate dates for the current range
    const expandedRecurringHolidays = recurringHolidays.flatMap((holiday) => {
      const holidayDate = new Date(holiday.date);
      const results: typeof recurringHolidays = [];

      // Check each year in the range
      for (
        let year = startDate.getFullYear();
        year <= endDate.getFullYear();
        year++
      ) {
        const thisYearDate = new Date(
          year,
          holidayDate.getMonth(),
          holidayDate.getDate(),
        );

        if (thisYearDate >= startDate && thisYearDate <= endDate) {
          results.push({
            ...holiday,
            date: thisYearDate,
          });
        }
      }

      return results;
    });

    // Combine and return all holidays
    const allHolidays = [...oneTimeHolidays, ...expandedRecurringHolidays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return NextResponse.json({ holidays: allHolidays }, { status: 200 });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 },
    );
  }
}
