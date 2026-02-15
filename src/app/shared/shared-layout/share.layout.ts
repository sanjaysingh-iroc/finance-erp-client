import { Injectable } from '@angular/core';
import { MatProgressButtonOptions } from 'mat-progress-buttons';

@Injectable({
    providedIn: 'root'
})
export class CommonLayout {

    public getprogressButton(title: string = 'Submit'): MatProgressButtonOptions {
        return {
            active: false,
            text: title,
            spinnerSize: 18,
            raised: true,
            stroked: false,
            buttonColor: 'primary',
            spinnerColor: 'accent',
            fullWidth: false,
            disabled: false,
            mode: 'indeterminate'

        };
    }

    get progressLoginButton(): MatProgressButtonOptions {
        return {
            active: false,
            text: 'LOGIN',
            spinnerSize: 18,
            raised: true,
            stroked: false,
            buttonColor: 'primary',
            spinnerColor: 'accent',
            fullWidth: true,
            disabled: false,
            mode: 'indeterminate'
        };
    }

}

