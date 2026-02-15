import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../company-settings/company.service';
import { first } from 'rxjs/operators';
import { CompanyModel } from '../../company-settings/company.model';
import { settings } from '../../demo/data';
import { formatDate } from '@angular/common';
import { BrandModel, ProductCategoryModel, StateModel } from '../../shared/common.models';
import { UtilsService } from '../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';

@Component({
  selector: 'app-proposal-format',
  templateUrl: './proposal-format.component.html',
  styleUrls: ['./proposal-format.component.sass']
})

export class ProposalFormatComponent implements OnInit {

  customerForm: FormGroup;
  productForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;
  company: CompanyModel;
  currency = settings.CURRENCY;
  productCategoryModels: ProductCategoryModel[] = [];
  productCategoryModelMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  brandModels: BrandModel[];
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productList: ProductModel[] = [];
  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  panelSelectedProductList: ProductModel[] = [];
  inverterSelectedProductList: ProductModel[] = [];
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  constructor(private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private productService: ProductService,

  ) { }

  ngOnInit(): void {
    this.utilsService.getBrandDetails().subscribe(data => {
      this.brandModels = data;
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });
    });

    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));


    this.productService.getAllProducts().subscribe(data => {
      this.productList = data;
      data.forEach(product => {
        this.productMap.set(product.id, product);
      });
    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(product => {
        if (product.id == 7 || product.id == 11 || product.id == 12) {
          this.productCategoryModels.push(product);
          this.productCategoryModelMap.set(product.id, product);
        }
      });
    });

    this.companyService.getCompanyDetails().pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;
    });

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      proposalNumber: ['', [Validators.required]],
      proposalDate: [new Date, Validators.required],
      address: ['', [Validators.required]],
      district: ['Firozabad', [Validators.required]],
      pincode: ['283203', [Validators.required]],
    });

    this.productForm = this.fb.group({
      capacity: ['', [Validators.required]],
      price: ['', [Validators.required]],
      priceWithGST: ['', [Validators.required]],

      gst: ['8.9', [Validators.required]],
      solarProductType: [10, [Validators.required]],
      solarBrandId: ['', [Validators.required]],
      solarModelNo: ['', Validators.required],
      solarQuantity: [0, [Validators.required, Validators.min(1)]],

      inverterProductType: ['', [Validators.required]],
      inverterBrandId: ['', [Validators.required]],
      inverterModelNo: ['', [Validators.required]],
    });
  }

  onBrandChange(event, productType) {
    const brandId = event.value;

    let productCategory = 0;

    if (productType == 'solar') {
      this.panelSelectedProductList = [];
      productCategory = this.productForm.get('solarProductType')?.value;

    } else {
      this.inverterSelectedProductList = [];
      productCategory = this.productForm.get('inverterProductType')?.value;

    }

    this.productList.forEach(product => {
      if (product.brandId == brandId && product.productType == productCategory) {
        if (productType == 'solar') {
          this.panelSelectedProductList.push(product);
        } else {
          this.inverterSelectedProductList.push(product);
        }
      }
    });
  }

  onGstChange(event) {
    const gstPercentage: number = parseFloat((event.target as HTMLInputElement).value);
    const amount: number = parseFloat(this.productForm.get("price")?.value);
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    this.productForm.get('priceWithGST')?.setValue(amount + gstAmt);
  }

  onPriceChange(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.productForm.get("gst")?.value;
    let gstAmt = parseFloat(((amount * gstPercentage) / 100).toFixed(2));
    this.productForm.get('priceWithGST')?.setValue(amount + gstAmt);
  }

  onTotalPriceChange(event) {
    // Remove GST: GST Amount = Original Cost – (Original Cost * (100 / (100 + GST% ) ) )
    const totalAmount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = parseFloat(this.productForm.get("gst")?.value);
    const amount = (totalAmount * (100 / (100 + gstPercentage))).toFixed(2);

    this.productForm.get('price')?.setValue(amount);
  }

  onSubmit() {
    this.generatePDF();
  }

  generatePDF(action = 'open') {
    this.pdfService.generateProposalPDF(this.company, this.getPDFData(), { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }

  private getPDFData() {
    const name = this.customerForm.get("name")?.value;
    const proposalNumber = this.customerForm.get("proposalNumber")?.value;
    const proposalDate = this.customerForm.get("proposalDate")?.value;
    const address = this.customerForm.get("address")?.value;
    const district = this.customerForm.get("district")?.value;
    const pincode = this.customerForm.get("pincode")?.value;

    const capacity = this.productForm.get("capacity")?.value;
    const price = this.productForm.get("price")?.value;
    const gst = this.productForm.get("gst")?.value;
    const solarBrandName = this.brandMap.get(this.productForm.get("solarBrandId")?.value)?.name;
    const inverterBrandName = this.brandMap.get(this.productForm.get("inverterBrandId")?.value)?.name;
    const solarQuantity = this.productForm.get("solarQuantity")?.value;

    const solarModelNo = this.productMap.get(this.productForm.get("solarModelNo")?.value)?.modelNo;
    const inverterModelNo = this.productCategoryModelMap.get(this.productForm.get("inverterProductType")?.value)?.name + '-' + this.productMap.get(this.productForm.get("inverterModelNo")?.value)?.modelNo;

    const itemDescriptionData = this.createPDFItemDescriptionData(capacity, solarQuantity, solarModelNo, solarBrandName, inverterModelNo, inverterBrandName);
    const pricingData = this.createPDFPricingData(capacity, price, gst);

    return [

      { text: 'Solar Power System Proposal', alignment: 'center', fontSize: 25, bold: true, color: 'blue' },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1 }]
      },
      '\n\n',
      {
        text: [
          { text: 'Date : ', bold: true, fontSize: 11, alignment: 'left' },
          { text: formatDate(proposalDate, settings.SHOW_DATE_FORMAT, 'en'), fontSize: 11, alignment: 'left' },
        ]
      },
      {
        text: [
          { text: 'Proposal No. : ', bold: true, fontSize: 11, alignment: 'left' },
          { text: proposalNumber, fontSize: 11, alignment: 'left' },
        ]
      },
      '\n',
      {
        text: [
          { text: 'To : M/S ', bold: true, fontSize: 11, alignment: 'left' },
          { text: name, fontSize: 11, alignment: 'left' },
        ]
      },
      { text: address, fontSize: 11, alignment: 'left' },
      { text: district + '-' + pincode, fontSize: 11, alignment: 'left' },
      {
        style: 'header',
        ol: [
          {
            margin: [0, 20, 0, 20],
            stack: [
              'Project Overview',
              { text: 'We are pleased to offer a turnkey solar PV system solution as per your requirements. The details of the proposed system are as follows:', style: 'subheaderLeft', bold: false },
              {
                style: 'subheaderLeft',
                bold: false,
                ul: [
                  'System Capacity (AC):' + capacity + ' KW',
                  'DC Capacity (kWp): ' + capacity + ' KW',
                  'Plant Type: Grid-Tied',
                  'Location: ' + district
                ]
              },
            ]
          },

          {
            margin: [0, 0, 0, 20],
            // A stack might be useful here if you have text *above* the table
            stack: [
              { text: 'System Configuration' },
              {
                style: 'subheader',
                bold: false,
                color: '#444',

                table: {
                  widths: ['5%', '20%', '35%', '12%', '8%', '5%', '15%'],
                  body: itemDescriptionData
                }
              },
              { text: 'Note:  This offer includes only the items listed above ', style: 'subheaderLeft', bold: false },
            ]
          },

          {
            margin: [0, 0, 0, 20],
            // A stack might be useful here if you have text *above* the table
            stack: [
              'System Configuration\n',
              {
                style: 'subheader',
                color: '#444',

                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: pricingData
                }
              },
              { text: 'Taxes: Prices are inclusive of GST', style: 'subheaderLeft', bold: false },
              { text: 'Validity: This offer is valid for  30 days  from the  date of issue.', style: 'subheaderLeft', bold: false },
            ]
          },
          { text: "", pageBreak: 'before' },
          {
            margin: [0, 0, 0, 20],
            stack: [
              { text: 'Scope of Supply' },
              { text: 'Included: ', style: 'subheaderLeft', bold: false },
              {
                style: 'subheaderLeft',
                bold: false,
                ul: [
                  '  Solar Modules',
                  'Inverters ',
                  'Mounting structure ',
                  'Basic cabling and connectors as per system size',
                  'Design and documentation support.',
                  'Installation',
                  'Electrical approvals & net metering  ',
                  'Transportation',

                ]
              },
              { text: 'Excluded: Electrical approvals & net Billing, online application fees & offline procedure, meter-testing fees till final.', style: 'subheaderLeft', bold: false },
            ]
          },
          {
            margin: [0, 0, 0, 20],
            stack: [
              'Payment Terms',
              {
                style: 'subheaderLeft',
                bold: false,
                ul: [
                  '50% Advance on Order Confirmation. ',
                  '30% after material Dispatch. ',
                  '10% after system installation.',
                  '10% After successful commissioning of the net meter arrangement ',
                ]
              },
              { text: 'Excluded: Electrical approvals & net Billing, online application fees & offline procedure, meter-testing fees till final.', style: 'subheaderLeft', bold: false },
            ]
          },
          {
            margin: [0, 0, 0, 20],
            stack: [
              'Delivery Schedule',
              { text: 'Dispatch within 30 days from receipt of advance payment and order confirmation.', style: 'subheaderLeft', bold: false },
            ]
          },
          {
            margin: [0, 0, 0, 20],
            stack: [
              'Warranty ',
              { text: ' Modules: ', style: 'subheaderLeft', bold: false },
              {
                style: 'subheaderLeft',
                bold: false,
                ul: [
                  '25 years(Performance)',
                  'Inverter: 10 years  ',
                  'BOS System Warranty: 1 year against manufacturing defects. ',
                ]
              }
            ]
          },
          {
            margin: [0, 0, 0, 20],
            stack: [
              'Contact ',
              { text: 'Mr. Sanjay Singh ', style: 'subheaderLeft', bold: false },
              { text: this.company.companyName, style: 'subheaderLeft', bold: false },
              { text: 'GSTNo.:- ' + this.company.gstNo, style: 'subheaderLeft', bold: false },
              { text: 'Add- ' + this.company.address, style: 'subheaderLeft', bold: false },
              { text: this.company.district + '-' + this.company.pinCode + ' (' + this.stateMap.get(this.company.stateId)?.name + ')', style: 'subheaderLeft', bold: false },
              { text: 'M: +91-' + this.company.mobile, style: 'subheaderLeft', bold: false },
              { text: 'Email: ' + this.company.email, style: 'subheaderLeft', bold: false }
            ]
          },

        ]
      },
    ];
  }


  private createPDFItemDescriptionData(capacity, panelQnty, panelSpec, panelBrand, inverterModel, inverterBrand) {
    let data = [];
    let index = 1;

    data.push([{ colSpan: 7, text: 'Bill of Quantity ', fontSize: 14, alignment: 'center', bold: true }, '', '', '', '', '', '']);
    data.push([{ text: 'Sr. No.', fontSize: 11, bold: true }, { text: 'Item Description', fontSize: 11, bold: true }, { text: 'Specification and Model', fontSize: 11, bold: true }, { text: 'Make', fontSize: 11, bold: true }, { text: 'Quantity', fontSize: 10, bold: true }, { text: 'Unit', fontSize: 11, bold: true }, { text: 'Note', fontSize: 11, bold: true },]);
    data.push([{ text: index++ }, { text: 'Solar PV module' }, { text: panelSpec }, { text: panelBrand }, { text: panelQnty }, { text: 'Nos.' }, { text: 'Total DC capacity-' + capacity + ' KW' },]);
    data.push([{ text: index++ }, { text: 'Solar Inverter' }, { text: inverterModel + '-' + capacity + ' KW' }, { text: inverterBrand }, { text: '1' }, { text: 'Nos.' }, { text: 'Total AC capacity-' + capacity + ' KW' },]);
    data.push([{ text: index++ }, { text: ' Module Mounting Structure' }, { text: 'Hot-dip / Gal Valium structure with Mid clamp A1 50 mm L Extruded 28 mm ht, End Clamp A1 50 mm L Extruded 35mm ht, ALLEN BOLT M8 X 20/M8 X 35 mm SS 304, SPRING NUT34mm GI, SPRING WASHER M8 SS 304' }, { text: 'Reputed' }, { text: 1 }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Remote Monitoring System' }, { text: 'Data Acquisition - Computerised string array monitoring with mobile app' }, { text: 'Reputed' }, { text: 1 }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Solar DC Cable' }, { text: '1100 V grade multistranded copper, 4sq.mm single core Fire-resistant cable DC cable' }, { text: 'Havells/ Polycab' }, { text: 'A/R' }, { text: 'Mtrs.' }, { text: '-' },]);
    data.push([{ text: index++ }, { rowSpan: 3, text: 'AC Cable' }, { text: '35 Sq.mm, 3.5 core, XLPE armored, min 1100 V grade multistranded Aluminium cable' }, { text: 'Havells/ Polycab' }, { text: 'N/A' }, { text: 'Mtrs.' }, { text: 'ACDB to Generation Meter LT Panel' },]);
    data.push([{ text: index++ }, { text: '' }, { text: '10 Sq.mm, 4 core, multistranded Copper cable' }, { text: 'Havells/ Polycab' }, { text: '6' }, { text: 'Mtrs.' }, { text: 'ACDB To Inverter' },]);
    data.push([{ text: index++ }, { text: '' }, { text: '6 Sq.mm, 1 core, multistranded Copper cable' }, { text: 'Havells/ Polycab' }, { text: '9' }, { text: 'Mtrs.' }, { text: 'Inverter Earthing' },]);
    data.push([{ text: index++ }, { text: 'ACDB' }, { text: 'IP65 Protected with MCB 4P 125A - 1 Nos., AC SPD Type II & mounting accessories.' }, { text: ' RIL Approved' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'MC4 Connector' }, { text: 'Multicontact MC4 connectors for solar panels' }, { text: 'Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Earthing Strip' }, { text: '25x3 mm HDGI strip' }, { text: 'True Power/Fast Earthing' }, { text: 'A/R' }, { text: 'Mtrs./Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Earthing Electrode' }, { text: '25 mm X1 MTR Copper-bound rods with pit cover' }, { text: 'True Power/Fast Earthing' }, { text: '3' }, { text: 'Nos.' }, { text: ' AC earthing- 1 Nos.\n DC earthing - 1 Nos.\n LA Earthing-1 Nos.' },]);
    data.push([{ text: index++ }, { text: 'Chemical Compound' }, { text: 'Bag of backfill chemical compound' }, { text: 'True Power/Fast Earthing' }, { text: '3' }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Lighting Arrester' }, { text: '2 mtrs ht Conventional Solid Copper Bonded with 5 Spike' }, { text: 'True Power/Fast Earthing' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Cable Conduit pipe' }, { text: 'Upvc Pipe' }, { text: 'Kothari/Prince/ Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Cable Ties' }, { text: '300mm length UV-protected cable ties' }, { text: 'Standard' }, { text: '5' }, { text: 'Packs' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Lugs' }, { text: 'Bi-metallic Lugs for Inverter Aluminium Lugs for LT panel' }, { text: 'Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: ' Gland' }, { text: 'double compression glands for multiple cables' }, { text: 'Reputed' }, { text: '0' }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Ferrules' }, { text: 'Plastic/Rubber A to Z, 0 to 9-set' }, { text: 'Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Insulators' }, { text: 'Epoxy insulators' }, { text: 'Reputed' }, { text: '100' }, { text: 'Nos.' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Insulator Tapes' }, { text: 'R, Y, B, Black coloured PVC tapes' }, { text: 'Steelgrip' }, { text: '4' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Nut bolts, connectors etc.' }, { text: 'HDGI/SS Nut bolts' }, { text: 'Branded Make' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: ' Drawings' }, { text: '3D Shadow analysis, 2D engineering layouts-general panel ]ayout, structure layout, SLD, string diagram, LA & earthing layout, cleaning system layout.' }, { text: '1' }, { text: '' }, { text: 'Job' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Miscellaneous Site works' }, { text: 'Miscellaneous project material & hardware' }, { text: '1' }, { text: '' }, { text: 'Job' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Transportation' }, { text: 'Transportation of the total project material till the site' }, { text: capacity + ' KW' }, { text: '1' }, { text: 'Job' }, { text: '-' },]);
    data.push([{ text: index++ }, { text: 'Installation  & Commissioning' }, { text: '' }, { text: capacity + ' KW' }, { text: '1' }, { text: 'Job' }, { text: 'including loading & unloading of the material, crane charges, labor charges, earth piling charges etc.' },]);

    return data;
  }

  private createPDFPricingData(capacity, price, gst) {
    let data = [];
    const gstAmount = ((capacity * 1000 * price) * gst) / 100;
    const amount = capacity * 1000 * price;

    data.push(['Capacity (KW)', ' DC Size (kWp) ', ' Kit Price (INR)', ' Price/Wp (INR)']);
    data.push([capacity + ' KW', capacity + ' KW', this.currency + ' ' + amount + '/-', this.currency + ' ' + price + '/-']);
    data.push([{ colSpan: 2, text: gst + '% GST' }, '', this.currency + ' ' + gstAmount + '/-', this.currency + ' ' + (gstAmount / (capacity * 1000)).toFixed(2) + '/-']);
    data.push([{ colSpan: 2, text: ' Total Price including GST' }, '', this.currency + ' ' + (amount + gstAmount).toFixed(2) + '/-', this.currency + ' ' + ((amount + gstAmount) / (capacity * 1000)).toFixed(2) + '/-']);

    return data;
  }
}
