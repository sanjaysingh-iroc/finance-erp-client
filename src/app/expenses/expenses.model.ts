export class ExpenseTypeMdel {
  id: number;
  expenseTypeName: string;
  isOther: boolean;
}

export class ExpensesModel {
  id: number;
  sessionYear: number;
  expenseTypeId: number;
  expensesDate: string;
  amount: number;
  otherInfo: string;
  uploadDocument: string;
  comment: string;
  approved: boolean;
  companyId: number;

  constructor(formData) {
    {
      this.id = formData.id;
      this.sessionYear = formData.sessionYear || '';
      this.expenseTypeId = formData.expenseTypeId || '';
      this.expensesDate = formData.expensesDate || '';
      this.amount = formData.amount || '';
      this.otherInfo = formData.otherInfo || '';
      this.comment = formData.comment || '';
      this.approved = formData.approved || false;
    }
  }
}


