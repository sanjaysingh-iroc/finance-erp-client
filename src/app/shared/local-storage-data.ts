import { Injectable } from '@angular/core';
import { LoginModel, LoginResponseModel, LoginCustomerModel, Token } from '../auth/login-model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RouteInfoModel } from '../company-settings/company.model';
import { SettingModel } from './common.models';
import { SessionModel } from '../session/session.model';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageData {

    staffObserver = new Subject<LoginModel>();
    public staffSubscriber$ = this.staffObserver.asObservable();

    customerObserver = new Subject<LoginModel>();
    public customerSubscriber$ = this.customerObserver.asObservable();

    selectedCustomer: number = 0;

    public userSubject: BehaviorSubject<LoginResponseModel>;
    public user: Observable<LoginResponseModel>;

    public settingSubject: BehaviorSubject<SettingModel[]>;
    public settings: Observable<SettingModel[]>;

    public navigationPathSubject: BehaviorSubject<string[]>;

    constructor() {
        this.staffObserver = new Subject<LoginModel>();
        this.staffSubscriber$ = this.staffObserver.asObservable();

        this.customerObserver = new Subject<LoginModel>();
        this.customerSubscriber$ = this.customerObserver.asObservable();

        this.selectedCustomer = parseInt(localStorage.getItem('selectedCustomer'));
        this.userSubject = new BehaviorSubject<LoginResponseModel>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();

        this.settingSubject = new BehaviorSubject<SettingModel[]>(JSON.parse(localStorage.getItem('settings')));
        this.settings = this.settingSubject.asObservable();


        this.navigationPathSubject = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('navigationsPath')));
    }

    public get selectedCustomerId(): number {
        return this.selectedCustomer;
    }

    public setSelectedCustomer(selectedCustomer: number) {

        localStorage.setItem('selectedCustomer', selectedCustomer.toString());
        this.selectedCustomer = selectedCustomer;
        this.customerObserver.next(this.customerValue);
    }

    public get userValue(): LoginModel {
        if (this.userSubject.value) {
            return this.userSubject.value.user;
        }
        return null;
    }

    public get customerValues(): LoginCustomerModel[] {
        if (this.userSubject.value) {
            return this.userSubject.value.customers;
        }
        return null;
    }

    public get customerValue(): LoginCustomerModel {
        if (this.userSubject.value && this.userSubject.value.customers) {
            for (const customer of this.userSubject.value.customers) {
                if (customer.id === this.selectedCustomer) {
                    return customer;
                }
            }
            const customer = this.userSubject.value.customers[0];
            this.selectedCustomer = customer.id;
            return customer;
        }

        return null;
    }

    public get tokenValue(): Token {
        if (this.userSubject.value) {
            return this.userSubject.value.token;
        }
        return null;
    }


    public get sessionValue(): SessionModel {
        if (this.userSubject.value) {
            return this.userSubject.value.session;
        }
        return null;
    }


    public get settingValues(): SettingModel[] {
        return this.settingSubject.value;
    }



    public get navigationValue(): RouteInfoModel[] {
        if (this.userSubject.value) {
            return this.userSubject.value.navigationDetails;
        }
        return null;
    }

    public get navigationPathValue(): string[] {
        return this.navigationPathSubject.value;
    }

    setLoginData(loginData: LoginResponseModel) {
        localStorage.setItem('user', JSON.stringify(loginData));
        this.userSubject = new BehaviorSubject<LoginResponseModel>(loginData);
        this.user = this.userSubject.asObservable();
    }

    setSettingData(settingModels: SettingModel[]) {
        localStorage.setItem('settings', JSON.stringify(settingModels));
        this.settingSubject = new BehaviorSubject<SettingModel[]>(settingModels);
        this.settings = this.settingSubject.asObservable();
    }

    updateLoginUser(user: LoginModel) {
        this.staffObserver.next(user);
        const loginData: LoginResponseModel = (JSON.parse(localStorage.getItem('user')));
        loginData.user = user;
        this.setLoginData(loginData);
    }

    setSession(sessionModel: SessionModel) {
        const loginData: LoginResponseModel = (JSON.parse(localStorage.getItem('user')));
        loginData.session = sessionModel;
        this.setLoginData(loginData);
    }

    setToken(token: Token) {
        const loginData: LoginResponseModel = (JSON.parse(localStorage.getItem('user')));
        loginData.token = token;
        this.setLoginData(loginData);
    }

    setNavigationPath(navigationPath: string[]) {
        localStorage.setItem('navigationsPath', JSON.stringify(navigationPath));
        this.navigationPathSubject = new BehaviorSubject<string[]>(navigationPath);
    }
}
