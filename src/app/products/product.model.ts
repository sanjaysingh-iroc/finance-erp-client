import { formatDate } from '@angular/common';
import { settings } from '../demo/data';

export class ProductModel {
  id: number;
  productType: number;
  brandId: number;
  modelNo: string;
  hsnCode: string;
  rate: number;
  price: number;
  warrantyInYear: number;
  warrantyInMonth: number;
  distributorName: number;
  capacity: string;
  uploadImg: string;
  details: string;
  active: number;

  constructor(formData) {
    {
      this.id = formData.id;
      this.productType = formData.productType || '';
      this.brandId = formData.brandId || '';
      this.modelNo = formData.modelNo || '';
      this.hsnCode = formData.hsnCode || '';
      this.rate = formData.rate || '';
      this.price = formData.price || '';
      this.warrantyInYear = formData.warrantyInYear || 0;
      this.warrantyInMonth = formData.warrantyInMonth || 0;
      this.distributorName = formData.distributorName || '';
      this.capacity = formData.capacity || '';
      this.details = formData.details || '';
      this.active = formData.active || 1;
    }
  }
}


export class InventoryModel {
  id: number;
  invoice: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  roundOffAmount: number;
  purchaseDate: string;
  distributorName: number;
  details: string;
  uploadBill: string;

  inventoryProductModels: InventoryProductModel[] = [];

  constructor(billData) {
    this.id = billData.id;
    this.amount = billData.amount;
    this.gstAmount = billData.gstAmount;
    this.invoice = billData.invoice;

    this.totalAmount = billData.totalAmount;
    this.roundOffAmount = billData.roundOffAmount;

    this.purchaseDate = billData.submissionDate ? formatDate(billData.submissionDate, settings.SAVE_DATE_FORMAT, 'en') : '';
    this.amount = billData.amount || '';
    this.details = billData.details || '';
    this.distributorName = billData.distributorName || '';

    this.inventoryProductModels = billData.inventoryProductModel;
  }
}

export class InventoryProductModel {
  id?: number;
  productId?: number;
  quantity?: number;
  serialNo?: string;
}
