import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class CompanyModel {
    id: number;
    companyName: string;
    companyPersonName: string;

    companyCode: string;
    establishmentDate: string;
    solarCode: string;
    gstNo: string;

    email: string;
    website: string;
    mobile: string;
    phoneNo: string;
    address: string;
    district: string;
    panNo: string;
    countryId: number;
    stateId: number;
    pinCode: string
    logoImg: string;
    upiImg: string;
    signImg: string;
    signWithStampImg: string;
    bankName: string
    accountNo: string;
    ifsc: string
    bankAddress: string;

    summerStartTime: string;
    summerEndTime: string;
    winterStartTime: string;
    winterEndTime: string;

    active: boolean;

    constructor(formData) {
        {
            this.id = formData.id;
            this.companyName = formData.companyName || '';
            this.companyPersonName = formData.companyPersonName || '';

            this.companyCode = formData.companyCode || '';

            this.establishmentDate = formData.establishmentDate ? formatDate(formData.establishmentDate, settings.SAVE_DATE_FORMAT, 'en') : '';
            this.solarCode = formData.solarCode || '';
            this.gstNo = formData.gstNo || '';

            this.email = formData.email || '';
            this.website = formData.website || '';
            this.mobile = formData.mobile || '';
            this.phoneNo = formData.phoneNo || '';
            this.address = formData.address || '';
            this.district = formData.district || '';
            this.panNo = formData.panNo || '';
            this.countryId = formData.countryId || '';
            this.stateId = formData.stateId || '';
            this.pinCode = formData.pinCode || '';

            this.bankName = formData.bankName || '';
            this.accountNo = formData.accountNo || '';
            this.ifsc = formData.ifsc || '';
            this.bankAddress = formData.bankAddress || '';

            this.summerStartTime = formData.summerStartTime || '';
            this.summerEndTime = formData.summerEndTime || '';
            this.winterStartTime = formData.winterStartTime || '';
            this.winterEndTime = formData.winterEndTime || '';
        }
    }
}

export interface RouteInfoModel {
    id: number;
    path: string;
    title: string;
    iconType: string;
    icon: string;
    class: string;
    groupTitle: boolean;
    badge: string;
    badgeClass: string;
    sequenceOrder: number;
    submenu: RouteInfoModel[];
}

export interface AclInfoModel {
    id: number;
    navigationId: number;
    userTypeId: number;
}

export class UpdateAclInfoModel {
    navigationIds: number[];
    companyId: number;
    userTypeId: number;
}
