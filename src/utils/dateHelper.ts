export const parseMonthString = (monthString: string): { startDate: Date; endDate: Date } => {
    const [year, month] = monthString.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) {
        throw new Error('Invalid month format. Use YYYY-MM');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return { startDate, endDate };
};

export const getMonthDateRange = (year: number, month: number): { startDate: Date; endDate: Date } => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

    return { startDate, endDate };
};

export const getCurrentMonthRange = (): { year: number; month: number } => {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1
    };
};

export const getLastNMonths = (count: number): Array<{ year: number; month: number; label: string; labelAr: string }> => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const labelAr = d.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

        months.push({ year, month, label, labelAr });
    }

    return months;
};
