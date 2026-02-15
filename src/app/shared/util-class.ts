import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';

@Injectable({
    providedIn: 'root'
})
export class Utils {
    tens = [
        "", "", "Twenty ", "Thirty ", "Forty ",
        "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "
    ];
    units = [
        "", "One ", "Two ", "Three ",
        "Four ", "Five ", "Six ", "Seven ",
        "Eight ", "Nine ", "Ten ", "Eleven ",
        "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ",
        "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    constructor(
        public _dateAdapter: DateAdapter<Date>,
    ) {
    }

    getDateAdaptor() {
        return this._dateAdapter;
    }

    formatToThreeDigits(num: number, length: number, appendString: string): string {
        // Convert the number to a string first
        const numString: string = String(num);

        // Pad the start with '0' until the total length is 3
        // If the string is already 3 digits or longer, it remains unchanged
        return numString.padStart(length, appendString);
    }

    convertToWords(n: number) {

        if (n === 0) {
            return "Zero";
        }

        const parts = n.toString().split('.');
        const numberInInt = parseFloat(parts[0]);
        //  const numberInDecimal =  parts.length > 1 ? parseFloat(parts[1]) : 0;



        const numberInDecimal = this.getDecimalValue(n.toFixed(2));

        let numberInWords = this.convertToWordsInt(numberInInt);
        if (numberInDecimal > 0) {
            numberInWords = numberInWords + " and " + this.convertToWordsInt(numberInDecimal) + "paise";

        }
        return numberInWords;

    }

    convertToWordsInt(n: number) {
        let numberInWords = '';

        while (n > 0) {
            if (n >= 100000) {
                const b = Math.floor(n / 100000);
                numberInWords = numberInWords + (this.convertToUnits(b)) + "Lakh ";
                n = n % (100000 * b);
            } else if (n >= 1000) {
                const b = Math.floor(n / 1000);
                numberInWords = numberInWords + (this.convertToUnits(b)) + "Thousand ";
                n = n % (1000 * b);
            } else if (n >= 100) {
                const b = Math.floor(n / 100);
                numberInWords = numberInWords + (this.convertToUnits(b)) + "Hundred ";
                n = n % (100 * b);
            } else {
                numberInWords = numberInWords + this.convertToUnits(n);
                n = 0;
            }
        }

        return numberInWords;

    }

    convertToUnits(n: number) {
        let numberInWords = '';
        while (n > 0) {
            if (n >= 20) {
                const b = Math.floor(n / 10);
                numberInWords = numberInWords + (this.tens[b]);
                n = n % (10 * b);
            } else if (n < 20) {
                numberInWords = numberInWords + (this.units[n]);
                n = 0;
            }
        }
        return numberInWords;
    }

    getDecimalPart(n: number) {
        return n - Math.floor(n);
    }


    getDecimalPartString(number: number) {
        const parts = number.toString().split('.');
        return parts.length > 1 ? parts[1] : '0'; // returns "33"
    }

    // To get a number value (e.g., 33) from the string:
    getDecimalValue(number: string) {
        const parts = number.split('.');
        return parts.length > 1 ? parseFloat(parts[1]) : 0; // returns 33
    }
    

    calculateDaysDifference(date1: Date, date2: Date): number {
    // Optional: Use Math.abs() if you don't care about the order of dates (always positive result)
    const differenceInMs = Math.abs(date2.getTime() - date1.getTime());
    
    // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    
    // Use Math.floor() to get a whole number of days
    const diffInDays = Math.floor(differenceInMs / millisecondsInDay);
    
    return diffInDays;
  }


}