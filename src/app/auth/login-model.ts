import { RouteInfoModel } from "../company-settings/company.model";
import { SessionModel } from "../session/session.model";

export interface LoginRequestModel {
  userName: string;
  password: string;
  tokenType: number;
  createdAt: string;
  expiredAt: string;
}

export class LoginResponseModel {
  user: LoginModel;
  customers: LoginCustomerModel[];
  token: Token;
  session: SessionModel;
  navigationDetails: RouteInfoModel[];
}

export class LoginModel {
  id: number;
  name: string;
  dob: string;
  email: string;
  mobile: string;
  userType: number;
  uploadImg: string;
  companyId: number;
}

export class LoginCustomerModel extends LoginModel {
  classId: number;
  sectionId: string;
  rollNo: number;
}


export class Token {
  id: number;
  userId: number;
  token: string;
  createdAt: string;
  expiredAt: string;
}

