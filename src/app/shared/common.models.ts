export class UploadFileModel {
  fileName: string;
  fileDownloadUri: string;
  fileType: string;
  size: number;
}

export class PaymentTypeModel {
  id: number;
  name: string;
  isCheque: boolean;
  isLoan: boolean;

}

export class GenderModel {
  id: number;
  name: string;
}


export class SettingModel {
  id: number;
  settingKey: string;
  settingValue: string;
}


export class ProductCategoryModel {
  id: number;
  name: string;
  gstPercentage: number;

}

export class ProductBrandModel {
  id: number;
  name: string;
}

export class BrandModel {
  id: number;
  name: string;
}
export class UserTypeModel {
  id: number;
  name: string;
}

export class WeeklyOffModel {
  id: number;
  name: string;
  weekDaysNumber: number;
  active: boolean;
}

export class IdProofModel {
  id: number;
  name: string;
}

export class PdfStyleModel {
  name: string;
  styleValue: string;

}

export class CountryModel {
  id: number;
  name: string;
}

export class StateModel {
  id: number;
  name: string;
  gstCode: string;
  countryId: number;
}

export class FullName {
  id: number;
  short: string;
  full: string;
}

export class CountModel {
  count: number;
  value: number;
}

export class AttendanceDataModel {
  absent: number;
  present: number;
  totalWeekend: number;
  totalHolidays: number;
  month: number;
  year: number;
}

export class AttendanceDtoModel {
  startDate: string;
  endDate: string;
  attendanceDates: AttendanceRequestModel[];
}

export class AttendanceRequestModel {
  ids: number[];
  attendanceDate: string;
}


export class HsnCodeModel {
  code: string;
  amount: number;
  gstPercentage: number;
  taxableAmount: number;
}

