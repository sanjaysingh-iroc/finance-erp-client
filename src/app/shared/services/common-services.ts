import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CommonServices {

    static getTwentyFourHourTime(amPmString) {
        var d = new Date("1/1/2013 " + amPmString);
        return d.getTime();
    }


}