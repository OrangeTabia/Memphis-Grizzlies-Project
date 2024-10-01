// helper function to get the start day of the week (Monday) for weekly granularity
export function getStartOfWeek(dateStr:string) {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0); 
    return date;
}

// helper function to group dates by week for weekly granularity
export function groupByWeek(data:any) {
    return data.reduce((result:any, item:any) => {
        const weekStart = getStartOfWeek(item.Date).toISOString().split('T')[0];
        if (!result[weekStart]) {
            result[weekStart] = [];
        }
        result[weekStart].push(item);
        return result;
    }, {})
}

// helper function to group dates by month for monthly granularity
export function groupByMonth(data:any) {
    return data.reduce((result:any, item:any) => {
        const date = new Date(item.Date);
        const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        if (!result[monthKey]) {
            result[monthKey] = [];
        }
        result[monthKey].push(item);
        return result;
    }, {});
}

// helper function to convert a string date into date object
export function orderDates(a:any, b:any) {
    const dateA = new Date(a.Date);
    const dateB = new Date(b.Date);
    let comparison = 0;
    if (dateA > dateB) {
        comparison = 1
    } else if (dateA < dateB) {
        comparison = -1;
    }
    return comparison;
}



