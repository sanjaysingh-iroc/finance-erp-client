import { FullName } from '../shared/common.models';

export let settings = {
    SAVE_DATE_FORMAT: 'yyyy-MM-dd',
    SHOW_DATE_FORMAT: 'dd/MM/yyyy',
    CURRENCY: '₹',
    CURRENCY_IN_WORD:'INR'
}

export const salutations: Map<number, string> = new Map([
    [1, "Mr."],
    [2, "Miss"],
    [3, "Mrs."],
    [4, "Dr."]
]);

export const weekMap: Map<number, FullName> = new Map([
    [0, { id: 0, short: 'Sun', full: 'Sunday' }],
    [1, { id: 1, short: 'Mon', full: 'Monday' }],
    [2, { id: 2, short: 'Tue', full: 'Tueday' }],
    [3, { id: 3, short: 'Wed', full: 'Wednesday' }],
    [4, { id: 4, short: 'Thu', full: 'Thursday' }],
    [5, { id: 5, short: 'Fri', full: 'Friday' }],
    [6, { id: 6, short: 'Sat', full: 'Saturday' }]
]);

export const monthMap: Map<number, FullName> = new Map([
    [4, { id: 4, short: 'April', full: 'April', order: 1 }],
    [5, { id: 5, short: 'May', full: 'May', order: 2 }],
    [6, { id: 6, short: 'June', full: 'June', order: 3 }],
    [7, { id: 7, short: 'July', full: 'July', order: 4 }],
    [8, { id: 8, short: 'Aug', full: 'August', order: 5 }],
    [9, { id: 9, short: 'Sept', full: 'September', order: 6 }],
    [10, { id: 10, short: 'Oct', full: 'October', order: 7 }],
    [11, { id: 11, short: 'Nov', full: 'November', order: 8 }],
    [12, { id: 12, short: 'Dec', full: 'December', order: 9 }],
    [1, { id: 1, short: 'Jan', full: 'January', order: 10 }],
    [2, { id: 2, short: 'Feb', full: 'February', order: 11 }],
    [3, { id: 3, short: 'March', full: 'March', order: 12 }],
]);