import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CashReceiptModel, SolarAgreementModel, SolarEstimateModel, SolarProposalModel } from './document.model';
import { settings } from '../../demo/data';
import { formatDate } from '@angular/common';
import { Utils } from '../../shared/util-class';

@Injectable({
  providedIn: 'root'
})
export class DocumentPdfService {
  currency = settings.CURRENCY;
  currencyInWord = settings.CURRENCY_IN_WORD;

  constructor(private httpClient: HttpClient,
    public utils: Utils,
  ) {
  }

  public getProposalData(solarProposalModel: SolarProposalModel, brandMap, productsMap, productCategoryModelMap, company, stateMap) {
    const solarBrandName = brandMap.get(productsMap.get(solarProposalModel.solarModelId)?.brandId)?.name;
    const inverterBrandName = brandMap.get(productsMap.get(solarProposalModel.inverterModelId)?.brandId)?.name;
    const batteryBrandName = brandMap.get(productsMap.get(solarProposalModel.batteryModelId)?.brandId)?.name;

    const solarModelNo = productsMap.get(solarProposalModel.solarModelId)?.modelNo;
    const batteryCapacity = productsMap.get(solarProposalModel.batteryModelId)?.capacity;

    const inverterModelNo = productCategoryModelMap.get(productsMap.get(solarProposalModel.inverterModelId)?.productType)?.name + '-' + productsMap.get(solarProposalModel.inverterModelId)?.modelNo;

    let itemDescriptionData = [];
    let index = 1;

    itemDescriptionData.push([{ colSpan: 7, text: 'Bill of Quantity ', fontSize: 14, alignment: 'center', bold: true }, '', '', '', '', '', '']);
    itemDescriptionData.push([{ text: 'Sr. No.', fontSize: 11, bold: true }, { text: 'Item Description', fontSize: 11, bold: true }, { text: 'Specification and Model', fontSize: 11, bold: true }, { text: 'Make', fontSize: 11, bold: true }, { text: 'Quantity', fontSize: 10, bold: true }, { text: 'Unit', fontSize: 11, bold: true }, { text: 'Note', fontSize: 11, bold: true },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Solar PV module' }, { text: solarModelNo }, { text: solarBrandName }, { text: solarProposalModel.solarQuantity }, { text: 'Nos.' }, { text: 'Total DC capacity-' + solarProposalModel.capacity + ' KW' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Solar Inverter' }, { text: inverterModelNo + '-' + solarProposalModel.inverterCapacity + ' KW' }, { text: inverterBrandName }, { text: '1' }, { text: 'Nos.' }, { text: 'Total AC capacity-' + solarProposalModel.inverterCapacity + ' KW' },]);
    if (solarProposalModel.batteryQuantity > 0) {
      itemDescriptionData.push([{ text: index++ }, { text: 'Batteries' }, { text: batteryCapacity }, { text: batteryBrandName }, { text: solarProposalModel.batteryQuantity }, { text: 'Nos.' }, { text: '-' },]);
    }
    itemDescriptionData.push([{ text: index++ }, { text: ' Module Mounting Structure' }, { text: 'Hot-dip / Gal Valium structure with Mid clamp A1 50 mm L Extruded 28 mm ht, End Clamp A1 50 mm L Extruded 35mm ht, ALLEN BOLT M8 X 20/M8 X 35 mm SS 304, SPRING NUT34mm GI, SPRING WASHER M8 SS 304' }, { text: 'Reputed' }, { text: 1 }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Remote Monitoring System' }, { text: 'Data Acquisition - Computerised string array monitoring with mobile app' }, { text: 'Reputed' }, { text: 1 }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Solar DC Cable' }, { text: '1100 V grade multistranded copper, 4 sq.mm single core Fire-resistant cable DC cable' }, { text: 'Havells/ Polycab' }, { text: 'A/R' }, { text: 'Mtrs.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'AC Cable' }, { text: '4 sq.mm single core Fire-resistant cable AC cable' }, { text: 'Havells/ Polycab' }, { text: 'N/A' }, { text: 'Mtrs.' }, { text: 'ACDB to Generation Meter LT Panel' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Earthing Cable' }, { text: 'IP65 Protected with MCB 4P 125A - 1 Nos., AC SPD Type II & mounting accessories.' }, { text: ' RIL Approved' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'ACDB' }, { text: 'IP65 Protected, AC SPD Type II & mounting accessories.' }, { text: ' RIL Approved' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'DCDB' }, { text: 'IP65 Protected , SPD Type II & mounting accessories.' }, { text: ' RIL Approved' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'MC4 Connector' }, { text: 'Multicontact MC4 connectors for solar panels' }, { text: 'Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Earthing Strip' }, { text: '25x3 mm HDGI strip' }, { text: 'True Power/Fast Earthing' }, { text: 'A/R' }, { text: 'Mtrs./Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Earthing Electrode' }, { text: '25 mm X1 MTR Copper-bound rods with pit cover' }, { text: 'True Power/Fast Earthing' }, { text: '3' }, { text: 'Nos.' }, { text: ' AC earthing- 1 Nos.\n DC earthing - 1 Nos.\n LA Earthing-1 Nos.' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Chemical Compound' }, { text: 'Bag of backfill chemical compound' }, { text: 'True Power/Fast Earthing' }, { text: '3' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Lighting Arrester' }, { text: '2 mtrs ht Conventional Solid Copper Bonded with 5 Spike' }, { text: 'True Power/Fast Earthing' }, { text: '1' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Cable Conduit pipe' }, { text: 'Upvc Pipe' }, { text: 'Kothari/Prince/ Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Cable Ties' }, { text: '300mm length UV-protected cable ties' }, { text: 'Standard' }, { text: '5' }, { text: 'Packs' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Ferrules' }, { text: 'Plastic/Rubber A to Z, 0 to 9-set' }, { text: 'Reputed' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Insulators' }, { text: 'Epoxy insulators' }, { text: 'Reputed' }, { text: '100' }, { text: 'Nos.' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Insulator Tapes' }, { text: 'R, Y, B, Black coloured PVC tapes' }, { text: 'Steelgrip' }, { text: '4' }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Nut bolts, connectors etc.' }, { text: 'HDGI/SS Nut bolts' }, { text: 'Branded Make' }, { text: '1' }, { text: 'Set' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Miscellaneous Site works' }, { text: 'Miscellaneous project material & hardware' }, { text: '1' }, { text: '' }, { text: 'Job' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Transportation' }, { text: 'Transportation of the total project material till the site' }, { text: solarProposalModel.capacity + ' KW' }, { text: '1' }, { text: 'Job' }, { text: '-' },]);
    itemDescriptionData.push([{ text: index++ }, { text: 'Installation  & Commissioning' }, { text: '' }, { text: solarProposalModel.capacity + ' KW' }, { text: '1' }, { text: 'Job' }, { text: 'including loading & unloading of the material, crane charges, labor charges, earth piling charges etc.' },]);



    let pricingData = [];
    const gstAmount = ((solarProposalModel.amount) * solarProposalModel.gst) / 100;
    const amount = solarProposalModel.amount;

    pricingData.push(['Capacity (KW)', ' DC Size (kWp) ', ' Kit Price (INR)']);
    pricingData.push([solarProposalModel.inverterCapacity + ' KW', solarProposalModel.capacity + ' KW', this.currency + ' ' + amount + '/-']);
    pricingData.push([{ colSpan: 2, text: solarProposalModel.gst + '% GST' }, '', this.currency + ' ' + gstAmount.toFixed(2) + '/-']);
    pricingData.push([{ colSpan: 2, text: ' Total Price including GST' }, '', this.currency + ' ' + (amount + gstAmount).toFixed(2) + '/-']);

    return [

      { text: 'Solar Power System Proposal', alignment: 'center', fontSize: 25, bold: true, color: 'blue' },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1 }]
      },
      '\n\n',
      {
        text: [
          { text: 'Date : ', bold: true, fontSize: 11, alignment: 'left' },
          { text: formatDate(solarProposalModel.proposalDate, settings.SHOW_DATE_FORMAT, 'en'), fontSize: 11, alignment: 'left' },
        ]
      },
      {
        text: [
          { text: 'Proposal No. : ', bold: true, fontSize: 11, alignment: 'left' },
          { text: solarProposalModel.serialNo, fontSize: 11, alignment: 'left' },
        ]
      },
      '\n',
      {
        text: [
          { text: 'To : M/S ', bold: true, fontSize: 11, alignment: 'left' },
          { text: solarProposalModel.customerName, fontSize: 11, alignment: 'left' },
        ]
      },
      { text: solarProposalModel.address, fontSize: 11, alignment: 'left' },
      { text: solarProposalModel.district + '-' + solarProposalModel.pinCode, fontSize: 11, alignment: 'left' },
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
                  'System Capacity (AC):' + solarProposalModel.inverterCapacity + ' KW',
                  'DC Capacity (kWp): ' + solarProposalModel.capacity + ' KW',
                  'Plant Type: Grid-Tied',
                  'Location: ' + solarProposalModel.district
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
                  widths: ['40%', '30%', '30%'],
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
              { text: company.companyPersonName, style: 'subheaderLeft', bold: false },
              { text: company.companyName, style: 'subheaderLeft', bold: false },
              { text: 'GSTNo.:- ' + company.gstNo, style: 'subheaderLeft', bold: false },
              { text: 'Add- ' + company.address, style: 'subheaderLeft', bold: false },
              { text: company.district + '-' + company.pinCode + ' (' + stateMap.get(company.stateId)?.name + ')', style: 'subheaderLeft', bold: false },
              { text: 'M: +91-' + company.mobile, style: 'subheaderLeft', bold: false },
              { text: 'Email: ' + company.email, style: 'subheaderLeft', bold: false }
            ]
          },

        ]
      },
    ];
  }

  public getEstimatePDFData(solarEstimateModel: SolarEstimateModel, companyModel, productsMap, brandMap, installationProduct) {
    const amount: number = solarEstimateModel.amount;
    const gstPercentage: number = solarEstimateModel.gst;
    let gstAmount: number = (amount * gstPercentage) / 100;

    const priceWithGST: number = parseFloat((amount + gstAmount).toFixed(2));
    const amountInWords = this.utils.convertToWords(priceWithGST);

    let itemDescriptionData = [];
    let index = 1;

    const solarProduct = productsMap.get(solarEstimateModel.solarModelId);
    const inverterProduct = productsMap.get(solarEstimateModel.inverterModelId);

    const solarModelId = brandMap.get(solarProduct?.brandId)?.name + '-' + solarProduct?.modelNo;
    const inverterModelId = brandMap.get(inverterProduct?.brandId)?.name + '-' + inverterProduct?.modelNo;

    itemDescriptionData.push([{ text: 'Sr. No.', fontSize: 11, bold: true, alignment: 'center' }, { text: 'Item Name', fontSize: 11, bold: true, alignment: 'center' }, { text: 'Size/ QTY', fontSize: 11, bold: true, alignment: 'center' }, { text: 'AMOUNT (Rs)', fontSize: 11, bold: true, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'DCR SOLAR Panels BiFacial \n', bold: true }, { text: solarEstimateModel.capacity + ' KW ', alignment: 'center' }, { rowSpan: 11, text: this.currency + ' ' + priceWithGST + '/-', alignment: 'center', margin: [0, 100, 0, 0] }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Grid tied Inverter, ' + solarEstimateModel.capacity + ' KW ', bold: true }, { text: 1, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Earthing Rod Set with Chemical Bag', bold: true }, { text: 3, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Lightening Arrester', bold: true }, { text: 1, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Solar Surge Protector (ACDB + DCDB)', bold: true }, { text: 1, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'AC + DC + Earthing Wire ', bold: true }, { text: 'As per requirement', alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'MC4 Connector', bold: true }, { text: 4, alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'GI Structure', bold: true }, { text: 'LS', alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Cable Tie, Electric Tape, PVC Pipe etc.', bold: true }, { text: 'LS', alignment: 'center' }]);
    itemDescriptionData.push([{ text: index++, alignment: 'center' }, { text: 'Installation, Testing & Commissioning of above set up', bold: true }, { text: 'Set Up', alignment: 'center' }]);
    itemDescriptionData.push([{ colSpan: 3, text: 'Total ', bold: true, alignment: 'right' }, { text: '' }, { text: '' }, { text: this.currency + ' ' + priceWithGST + '/-', alignment: 'center' }]);

    return [

      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1 }]
      },
      { text: 'PROFORMA INVOICE', alignment: 'center', fontSize: 25, bold: true, color: 'blue' },
      {
        margin: [0, 10, 0, 0],
        fontSize: 10,
        layout: 'noBorders',
        table: {

          widths: ['80%', '20%'],
          body: [
            [{ text: 'Estimate For:', alignment: 'left', bold: true }, { text: 'Estimate Details', alignment: 'right', bold: true }],
            [{ text: solarEstimateModel.customerName, fontSize: 11, alignment: 'left', bold: true }, { text: 'Estimate No. :- ' + solarEstimateModel.serialNo, fontSize: 11, alignment: 'right' },],
            [{ text: solarEstimateModel.address + solarEstimateModel.address + ', ' + solarEstimateModel.district + '-' + solarEstimateModel.pinCode, fontSize: 11, alignment: 'left' }, { text: 'Date : ' + formatDate(solarEstimateModel.estimateDate, settings.SHOW_DATE_FORMAT, 'en'), fontSize: 11, alignment: 'right' },]
          ]
        }
      },
      {
        margin: [0, 20, 0, 0],
        fontSize: 10,
        table: {
          widths: ['10%', '45%', '20%', '15%'],
          body: itemDescriptionData
        }
      },
      {
        margin: [0, 20, 0, 0],
        alignment: 'left',
        columns: [
          [
            { text: 'Estimate Amount In Words:', alignment: 'left', bold: true },
            { text: amountInWords + ' Only', fontSize: 11, alignment: 'left' },
            { text: 'Terms and Conditions\n', fontSize: 11, alignment: 'left', bold: true },
            { text: 'Warranty as per manufacturer policy ', fontSize: 11, alignment: 'left' },
            { text: 'Subject To ' + companyModel.district + ' juridiction', fontSize: 11, alignment: 'left' },
            {
              alignment: 'left',
              columns: [
                [
                  { text: 'Pay To:\n', alignment: 'justify', bold: true },
                  { text: 'Bank: ' + companyModel.bankName, fontSize: 11, alignment: 'justify' },
                  { text: 'Bank Account No. : ' + companyModel.accountNo, fontSize: 11, alignment: 'left' },

                  { text: 'IFSC: ' + companyModel.ifsc, fontSize: 11, alignment: 'justify' },
                  { text: 'Branch: ' + companyModel.bankAddress, fontSize: 11, alignment: 'justify' },
                  { text: "Account holder's name : " + companyModel.companyName, fontSize: 11, alignment: 'justify' },
                ],
              ]
            },

          ],
          [

            {
              style: 'tableExample',
              alignment: 'right',
              layout: 'noBorders',
              table: {
                alignment: 'right',
                widths: ['50%', '50%',],
                body: [
                  [{ text: 'Sub Total', alignment: 'left' }, { text: this.currency + ' ' + amount, alignment: 'right' }],
                  [{ text: 'CGST @ ' + solarEstimateModel.gst / 2 + '%', alignment: 'left' }, { text: this.currency + ' ' + (gstAmount / 2).toFixed(2), alignment: 'right' }],
                  [{ text: 'SGST @ ' + solarEstimateModel.gst / 2 + '%', alignment: 'left' }, { text: this.currency + ' ' + (gstAmount / 2).toFixed(2), alignment: 'right' }],
                  [{ text: 'CGST @ 9%', alignment: 'left' }, { text: this.currency + ' 0.00', alignment: 'right' }],
                  [{ text: 'SGST @ 9%', alignment: 'left' }, { text: this.currency + ' 0.00', alignment: 'right' }],
                  [{ text: 'Total', alignment: 'left', fillColor: '#52609E', color: 'white', bold: true }, { text: this.currency + ' ' + priceWithGST.toFixed(2), alignment: 'right', fillColor: '#52609E', color: 'white', bold: true }],
                ]
              }
            },
            '\n\n\n',
            { text: 'For : ' + companyModel.companyName, bold: true, fontSize: 11, alignment: 'right' },
            '\n\n\n\n\n\n',
            { text: 'Authorized Signatory : ', bold: true, fontSize: 11, alignment: 'right' },

          ],

        ]
      },
    ];
  }

  public createEstimateHeader(company, stateMap) {
    return {
      margin: [20, 10, 0, 0],
      columns: [
        [
          { text: company.companyName, fontSize: 18, alignment: 'left', bold: true },
          { text: company.address + ',' + company.district + '-' + company.pinCode, fontSize: 10, alignment: 'left' },
          { text: 'Phone No.: +91-' + company.mobile, fontSize: 10, alignment: 'left' },
          { text: 'Email: ' + company.email, fontSize: 10, alignment: 'left' },
          { text: 'GSTIN: ' + company.gstNo, fontSize: 10, alignment: 'left' },
          { text: 'State: ' + stateMap.get(company.stateId)?.gstCode + '-' + stateMap.get(company.stateId)?.name, fontSize: 10, alignment: 'left' },

        ],
        {
          image: 'logo',
          width: 60,
          height: 60,
          alignment: 'right',
          absolutePosition: { x: 60, y: 5 }
        },

      ]
    }
  }

  public getMoneyReceiptPDFData(cashReceiptModel: CashReceiptModel, paymentTypeMap) {

    const amountInWords = this.utils.convertToWords(cashReceiptModel.amount);
    const paymentType = paymentTypeMap.get(cashReceiptModel.paymentMode)?.name;
    const proposalDate = formatDate(cashReceiptModel.purchaseDate, settings.SHOW_DATE_FORMAT, 'en');
    return [

      '\n',
      {
        alignment: 'justify',
        columns: [
          {
            width: 420,
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 50, y1: 5,
                    x2: 170 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                    lineWidth: 0.5,
                    dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
                  }
                ]
              },
              { text: cashReceiptModel.invoiceSerial, fontSize: 12, bold: true, relativePosition: { x: 50, y: -12 } },
              { text: 'Memo No.', fontSize: 10, relativePosition: { x: 0, y: -10 } },
            ]
          },

          {
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 30, y1: 5,
                    x2: 200 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                    lineWidth: 0.5,
                    dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
                  }
                ]
              },
              { text: 'Date:', fontSize: 12, relativePosition: { x: 0, y: -10 } },
              { text: proposalDate, fontSize: 12, bold: true, relativePosition: { x: 30, y: -12 } },
            ]
          }
        ]
      },
      '\n\n\n',

      {
        alignment: 'left',
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 70, y1: 5,
                x2: 520 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                lineWidth: 0.5,
                dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
              }
            ]
          },
          { text: cashReceiptModel.customerName, fontSize: 12, bold: true, relativePosition: { x: 150, y: -12 } },
          { text: 'Received with thanks from', fontSize: 10, relativePosition: { x: 0, y: -10 } },
        ]
      },
      '\n',
      {
        alignment: 'left',
        stack: [
          // 1. Define the rectangle (the "box")
          {
            canvas: [
              {
                type: 'line',
                x1: 70, y1: 5,
                x2: 520 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                lineWidth: 0.5,
                dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
              }
            ]
          },
          { text: this.currencyInWord + ' ' + amountInWords + ' ONLY', fontSize: 12, bold: true, relativePosition: { x: 150, y: -12 } },
          { text: 'Amount in words', fontSize: 10, relativePosition: { x: 0, y: -10 } },
        ]
      },
      '\n',

      {
        alignment: 'left',
        columns: [
          {
            width: 250,
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 70, y1: 5,
                    x2: 320 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                    lineWidth: 0.5,
                    dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
                  }
                ]
              },
              { text: paymentType, fontSize: 12, bold: true, relativePosition: { x: 150, y: -12 } },
              { text: 'By Cash/Cheque', fontSize: 10, relativePosition: { x: 0, y: -10 } },
            ]
          },
          {
            width: 200,
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 25, y1: 5,
                    x2: 250 - 2 * 40, y2: 5,
                    lineWidth: 0.5,
                    dash: { length: 1, space: 2 }
                  }
                ]
              },
              { text: cashReceiptModel.bankName, fontSize: 12, bold: true, relativePosition: { x: 60, y: -12 } },
              { text: 'Bank', fontSize: 10, relativePosition: { x: 0, y: -10 } },
            ]
          },
          {
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 25, y1: 5,
                    x2: 180 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                    lineWidth: 0.5,
                    dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
                  }
                ]
              },
              { text: proposalDate, fontSize: 12, bold: true, relativePosition: { x: 35, y: -12 } },
              { text: 'Date', fontSize: 10, relativePosition: { x: 0, y: -10 } },
            ]
          }
        ]
      },
      '\n',
      {
        alignment: 'left',
        stack: [
          // 1. Define the rectangle (the "box")
          {

            canvas: [
              {
                type: 'line',
                x1: 70, y1: 5,
                x2: 520 - 2 * 40, y2: 5, // Adjust x2 based on page width and margins
                lineWidth: 0.5,
                dash: { length: 1, space: 2 } // This creates a dotted effect (small length, small space)
              }
            ]
          },
          { text: cashReceiptModel.details, fontSize: 12, bold: true, relativePosition: { x: 100, y: -12 } },
          { text: 'For the purpose of', fontSize: 10, relativePosition: { x: 0, y: -10 } },
        ]
      },


      '\n\n',
      {
        columns: [
          {
            margin: [0, 40, 0, 0],
            width: 250,
            alignment: 'left',
            stack: [
              {
                canvas: [
                  {
                    type: 'rect',
                    x: 60, y: 0,
                    // r: 10,
                    w: 100, h: 20, // Width and height of the box
                    color: '#eeeeee', // Background color
                    lineColor: '#000000', // Border color
                    lineWidth: 1
                  }
                ]
              },
              { text: this.currency + cashReceiptModel.amount + '/-', fontSize: 15, bold: true, relativePosition: { x: 70, y: -19 } },
              { text: 'Amount', fontSize: 15, bold: true, relativePosition: { x: 0, y: -19 } },
            ]
          },
          { margin: [0, 40, 0, 0], text: 'Received by', fontSize: 10, alignment: 'left', width: 170 },

          [
            {
              image: 'signImg',
              width: 100,
              height: 40,
              alignment: 'left',
            },
            { text: 'Authorised Signature', fontSize: 10, alignment: 'left', },
          ],
        ]
      },

    ];
  }

  public createMoneyReceiptHeader(companyModel) {
    return {
      margin: [20, 10, 20, 0],
      alignment: 'justify',
      columns: [
        {
          image: 'logo',
          width: 60,
          height: 60,
          alignment: 'left',
          // absolutePosition: { x: 20, y: 570 }
        },
        {
          width: 290,
          alignment: 'center',
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 60, y: 10,
                  r: 10,
                  w: 210, h: 50, // Width and height of the box
                  color: '#eeeeee', // Background color
                  lineColor: '#000000', // Border color
                  lineWidth: 1
                }
              ]
            },
            { text: 'PAYMENT RECEIPT', fontSize: 23, bold: true, color: 'blue', relativePosition: { x: 30, y: -40 } },
          ]
        },
        [
          { text: companyModel.companyName, fontSize: 18, alignment: 'left', bold: true },
          { text: companyModel.address + ',' + companyModel.district + '-' + companyModel.pinCode, fontSize: 10, alignment: 'left' },
          { text: 'Phone No.: +91-' + companyModel.mobile, fontSize: 10, alignment: 'left' },
          { text: 'Email: ' + companyModel.email, fontSize: 10, alignment: 'left' },
          { text: 'GSTIN: ' + companyModel.gstNo, fontSize: 10, alignment: 'left' },

        ],

      ]
    };
  }

  public getMoneyReceiptBackgorundLogoPosition() {
    return {
      columns: [
        {
          canvas: [
            {
              type: 'rect',
              x: 10, y: 10,
              // r: 10,
              w: 575, h: 325, // Width and height of the box
              color: '#eeeeee', // Background color
              lineColor: '#000000', // Border color
              lineWidth: 1
            }
          ]
        },
        {
          image: 'logo',
          width: 400,
          height: 300,
          opacity: 0.1,
          alignment: 'center',
          absolutePosition: { x: 10, y: 0 }
        }

      ]
    };
  }

  public getSolarAgreementNewPDFData(solarAgreementModel: SolarAgreementModel, electricityBoard, productsMap, selectedCustomer, companyModel, brandMap) {
    const agreementDate = formatDate(solarAgreementModel.agreementDate, settings.SHOW_DATE_FORMAT, 'en');
    const solarProduct = productsMap.get(solarAgreementModel.solarModelId);
    const inverterProduct = productsMap.get(solarAgreementModel.inverterModelId);

    return [
      { text: 'Model Agreement', alignment: 'center', bold: true },
      '\n',
      { text: 'Between', alignment: 'center', bold: true },
      '\n',
      { text: 'Applicant and the registered/empanelled Vendor for installation of rooftop solar system in residential house of the Applicant under simplified procedure of Rooftop Solar Programme Ph- II', alignment: 'justify', bold: true },
      '\n',
      {
        text: [
          { text: 'This agreement is executed on ' },
          { text: agreementDate, bold: true },
          { text: ' for design, installation, commissioning and five years comprehensive maintenance of rooftop solar system to be installed under simplified procedure of Rooftop Solar Programme Ph-II. ' },
        ]
      },
      { text: 'Between', alignment: 'center', bold: true },

      {
        text: [
          { text: selectedCustomer.name, bold: true },
          { text: ' having residential electricity connection	with consumer number ' },
          { text: selectedCustomer.electricityMeterNo + ' ', bold: true },
          { text: electricityBoard, bold: true },
          { text: ' at ' },
          { text: selectedCustomer.address + ', ' + selectedCustomer.district + '-' + selectedCustomer.pinCode, bold: true },
        ]
      },

      { text: 'And', alignment: 'center', bold: true },
      {
        text: [
          { text: companyModel.companyName, bold: true },
          { text: ' is registered/ empanelled with The ' },
          { text: electricityBoard, bold: true },
          { text: ' and is having registered/functional office at ' },
          { text: companyModel.address + ', ' + companyModel.district + '-' + companyModel.pinCode, bold: true },
        ]
      },
      '\n',
      { text: 'Both Applicant and the Vendor are jointly referred as Parties.', alignment: 'justify' },
      '\n',
      { text: 'Whereas', bold: true },
      {
        ul: [
          { text: 'The Applicant intends to install rooftop solar system under simplified procedure of Rooftop Solar Programme Ph-II of the MNRE.', alignment: 'justify' },
          { text: 'The Vendor is registered/empanelled vendor with DISCOM for installation of rooftop solar under MNRE Schemes. The Vendor satisfies all the existing regulation pertaining to electrical safety and license in the respective state and it is not debarred or blacklisted from undertaking any such installations by any state/central Government agency.', alignment: 'justify' },
          { text: 'Both the parties are mutually agreed and understand their roles and responsibilities and have no liability to any other agency/firm/stakeholder especially to DISCOM and MNRE.', alignment: 'justify' },
        ]
      },
      {

        ol: [
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'GENERAL TERMS:', fontSize: 14, bold: true },
              {
                ol: [
                  {
                    counter: 1.1,
                    text: [
                      { text: 'The Applicant hereby represents and warrants that the Applicant has the sole legal capacity to enter into this Agreement and authorise the construction, installation and commissioning of the Rooftop Solar System (“ ' },
                      { text: 'RTS System', bold: true },
                      { text: '”) which is inclusive of Balance of System (“' },
                      { text: 'BoS', bold: true },
                      { text: '”) on the Applicant’s premises (“' },
                      { text: 'Applicant Site', bold: true },
                      { text: '”). The Vendor reserves its right to verify ownership of the Applicant Site and Applicant covenants to co-operate and provide all information and documentation required by the Vendor for the same.' },
                    ]
                  },
                  { counter: 1.2, text: 'Vendor may propose changes to the scope, nature and or schedule of the services being performed under this Agreement. All proposed changes must be mutually agreed between the Parties. If Parties fail to agree on the variation proposed, either Party may terminate this Agreement by serving notice as per Clause 13.', alignment: 'justify' },
                  { counter: 1.3, text: 'The Applicant understands and agrees that future changes in load, electricity usage patterns and/or electricity tariffs may affect the economics of the RTS System and these factors have not been and cannot be considered in any analysis or quotation provided by Vendor or its Authorized Persons (defined below).', alignment: 'justify' },

                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'RTS System:', fontSize: 14, bold: true },
              {
                ol: [
                  {
                    counter: 2.1,
                    text: [
                      { text: 'Total capacity of RTS System will be minimum ' },
                      { text: solarAgreementModel.capacity + ' kWp. ', bold: true },
                    ]
                  },
                  { counter: 2.2, text: 'The Solar modules, inverters and BoS will confirm to minimum specifications and DCR requirement of MNRE.', alignment: 'justify' },
                  {
                    counter: 2.3,
                    text: [
                      { text: 'Solar modules of ' },
                      { text: brandMap.get(solarProduct?.brandId)?.name + ' ', bold: true },
                      { text: 'make, DCR model,  ', bold: true },
                      { text: solarProduct?.capacity + '', bold: true },
                      { text: ' capacity each will be procured and installed by the Vendor ' }
                    ]
                  },

                  {
                    counter: 2.4,
                    text: [
                      { text: 'Solar inverter of ' },
                      { text: brandMap.get(inverterProduct?.brandId)?.name, bold: true },
                      { text: ' make, ' },
                      { text: inverterProduct?.modelNo + ' ', bold: true },
                      { text: inverterProduct?.capacity + ' ', bold: true },
                      { text: 'rated output capacity will be procured and installed by the Vendor' },
                    ]
                  },
                  { counter: 2.5, text: 'Module mounting structure has to withstand minimum wind load pressure as specified by MNRE.', alignment: 'justify' },
                  { counter: 2.6, text: 'Other BoS installations shall be as per best industry practice with all safety and protection gears installed by the vendor.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'PRICE AND PAYMENT TERMS', fontSize: 14, bold: true },

              {

                ol: [
                  {
                    counter: 3.1,
                    text: [
                      { text: 'The cost of RTS System will be ' },
                      { text: this.currency + ' ' + solarAgreementModel.amount + '/- ', bold: true },
                      { text: '(to be decided mutually). The Applicant shall pay the total cost to the Vendor as under: ' },

                    ]
                  },
                  {
                    type: 'lower-roman',
                    separator: ['(', ')'],
                    ol: [
                      { text: '20% as an advance on confirmation of the order;', alignment: 'justify' },
                      { text: '70% against Proforma Invoice (PI) before dispatch of solar panels, inverters and other BoS items to be delivered;', alignment: 'justify' },
                      { text: '10% after installation and commissioning of the RTS System.', alignment: 'justify' },
                    ]
                  },
                  { counter: 3.2, text: 'The order value and payment terms are fixed and will not be subject to any adjustment except as approved in writing by Vendor. The payment shall be made only through bankers’ cheque/ NEFT / RTGS / online payment portal as intimated by Vendor. No cash payments shall be accepted by Vendor or its Authorised Person.', alignment: 'justify' },
                ]
              },



            ]
          },


          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'REPRESENTATIONS MADE BY THE APPLICANT:', fontSize: 14, bold: true },
              { text: 'The Applicant acknowledges and agrees that:', alignment: 'justify' },
              {


                ol: [

                  {
                    ol: [
                      { counter: 4.1, text: 'any timeline or schedule shared by Vendor for the provision of services and delivery of the RTS System is only an estimate and Vendor will not be liable for any delay that is not attributable to Vendor;', alignment: 'justify' },
                      { counter: 4.2, text: 'all information disclosed by the Applicant to Vendor in connection with the supply of the RTS System (or any part thereof), services and generation estimation (including, without limitation, the load profile and power bill) are true and accurate, and acknowledges that Vendor has relied on the information produced by the Applicant to customise the RTS System layout and BoS design for the purposes of this Agreement;', alignment: 'justify' },
                      { counter: 4.3, text: 'all descriptive specifications, illustrations, drawings, data, dimensions, quotation, fact sheets, price lists and any advertising material circulated/published/provided by Vendor are approximate only;', alignment: 'justify' },
                      { counter: 4.4, text: 'any drawings, pre-feasibility report, specifications and plans composed by Vendor shall require the Applicant’s approval within 5 (five) days of its receipt by electronic mail to Vendor and if the Applicant does not respond within this period, the drawings, specifications or plans shall be final and deemed to have been approved by the Applicant;', alignment: 'justify' },
                      { counter: 4.5, text: 'he Applicant shall not use the RTS System or any part thereof, other than in accordance with the product manufacturer’s specifications, and covenants that any risk arising from misuse or/and misappropriate use shall be to the account of the Applicant alone.', alignment: 'justify' },
                      { counter: 4.6, text: 'The Applicant represents, warrants and covenants that:', alignment: 'justify' },
                      {


                        type: 'lower-roman',
                        ol: [
                          { text: 'all electrical and plumbing infrastructure at the Applicant Site are in conformity with applicable laws;', alignment: 'justify' },
                          { text: 'the Applicant has the legal capacity to permit unfettered access to Vendor and its Authorized Persons for the purposes of execution and performance of this Agreement;', alignment: 'justify' },
                          { text: 'the Applicant has and will provide requisite power, water and other requisite resources and storage facilities for construction, installation, operation and maintenance of the RTS System;', alignment: 'justify' },
                          { text: 'the Applicant will provide support for site fabrication of structure, assembly and fitting of module mounting structure at Applicant Site;', alignment: 'justify' },
                          { text: 'the Applicant will ensure that the Applicant Site is shadow free and free of all encumbrances during the lifetime of the RTS System;', alignment: 'justify' },
                          { text: 'Applicant should ensure that the Applicant regularly cleans and ensures accessibility and safety to the RTS System, as required by Vendor and dusting frequency in the premises.', alignment: 'justify' },
                          { text: 'Vendor is entitled to permit geo-tagging of the Applicant Site as a Vendor installation site;', alignment: 'justify' },
                          { text: 'Unless otherwise intimated by the Applicant in writing, Vendor is entitled to take photographs, videos and testimonials of the Applicant and the Applicant Site, and to create content which will become the property of Vendor and the same can be freely used by Vendor as part of its promotional and marketing activities across all platforms as it deems fit;', alignment: 'justify' },
                          { text: 'the Applicant validates the stability of the Applicant Site for the installation of the RTS System.', alignment: 'justify' },
                        ]
                      },
                    ]
                  },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'MAINTENANCE:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 5.1, text: 'Vendor shall provide five-year free workmanship maintenance. Vendor shall visit the Applicant’s premises at least once every quarter after commissioning of the RTS System for maintenance purposes.', alignment: 'justify' },
                  { counter: 5.2, text: 'During such maintenance visit, Vendor shall check all nuts and bolts, fuses, earth resistance and other consumables in respect of the RTS System to ensure that it is in good working condition.', alignment: 'justify' },
                  { counter: 5.3, text: 'Cleaning requirement/expectation from the Applicant side – Applicant responsibility, minimum expectation from Applicant that it will be cleaned regularly as per the dusting frequency.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'ACCESS AND RIGHT OF ENTRY:', fontSize: 14, bold: true },
              {

                ol: [
                  {
                    counter: 6.1,
                    text: [
                      { text: 'The Applicant hereby grants permission to Vendor and its authorized personnel, representatives, associates, officers, employees, financing agents, subcontractors (“' },
                      { text: 'Authorized Persons', bold: true },
                      { text: '”) to enter the Applicant Site for the purposes of:' },
                    ]
                  },
                  {
                    type: 'lower-alpha',

                    separator: ['(', ')'],

                    ol: [
                      { text: 'conducting feasibility study;', alignment: 'justify' },
                      { text: 'storing the RTS System/any part thereof;', alignment: 'justify' },
                      { text: 'installing the RTS System;', alignment: 'justify' },
                      { text: 'inspecting the RTS System;', alignment: 'justify' },
                      { text: 'conducting repairs and maintenance to the RTS System;', alignment: 'justify' },
                      { text: 'removing the RTS System (or any part thereof), if necessary for any reason whatsoever;', alignment: 'justify' },
                      { text: 'Such other matters as necessary to execute and perform its rights and obligations under this Agreement.', alignment: 'justify' },
                    ]
                  },
                  { counter: 6.2, text: 'The Applicant shall ensure that third-party consents necessary for the Authorized Persons to access the Applicant Site are obtained prior to commencement of services under this Agreement.', alignment: 'justify' },
                ]
              },
            ]
          },

          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'WARRANTIES:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 7.1, text: 'Product Warranty: The Applicant shall be entitled to manufacturers’ warranty. Any warranty in relation to RTS System supplied to the Applicant by Vendor under this Agreement is limited to the warranty given by the manufacturer of the RTS System (or any part thereof) to Vendor.', alignment: 'justify' },
                  { counter: 7.2, text: 'Installation Warranty: Vendor warrants that all installations shall be free from workmanship defects or BOS defects for a period of five years from the date of installation of the RTS System. The warranty is limited to Vendor rectifying the workmanship or BOS defects at Vendor’s expense in respect of those defects reported by the Applicant, in writing. The Applicant is obliged and liable to report such defects within 15 (fifteen) days of occurrence of such defect.', alignment: 'justify' },
                  { counter: 7.3, text: 'Subject to manufacturer warranty, Vendor warrants that the solar modules supplied herein shall have tolerance within a five percentage range (+/-5%). The peak-power point voltage and the peak-power point current of any supplied solar module and/or any module string (series connected modules) shall not vary by more than 5% (five percent) from the respective arithmetic means for all modules and/or for all module strings, as the case may be, provided the RTS System is properly maintained and the Applicant Site is free from shadow at the time of operation of the RTS System.', alignment: 'justify' },
                  { counter: 7.4, text: 'Exceptions for warranty:', alignment: 'justify' },
                  {


                    type: 'lower-alpha',
                    separator: ['(', ')'],
                    ol: [
                      { text: 'Any attempt by any person other than Vendor or its Authorised Persons to adjust, modify, repair or provide maintenance to the RTS System, shall disentitle the Applicant of the warranty provided by Vendor hereunder.', alignment: 'justify' },
                      { text: 'Vendor shall not be liable for any degeneration or damage to the RTS System due to any action or inaction on the part of the Applicant.', alignment: 'justify' },
                      { text: 'Vendor shall not be bound or liable to remedy any damage, fault, failure or malfunction of the RTS System owing to external causes, including but not limited to accidents, misuse, neglect, if usage and/or storage and/or installation are non-confirming to product instructions, modifications by the Applicant leading to shading or accessibility issues, failure to perform required maintenance, normal wear and tear, Force Majeure Event, or negligence or default attributable to the Applicant.', alignment: 'justify' },
                      { text: 'endor shall not be liable to repair or remedy any accessories or parts added to the RTS System that were not originally sourced by Vendor to the Applicant.', alignment: 'justify' },
                    ]
                  },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'PERFORMANCE GUARANTEE', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 8.1, text: 'Vendor guarantees minimum system performance ratio of 75% as per performance ratio test carried out in adherence to IEC 61724 or equivalent BIS for a period of five years.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'INSURANCE:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 9.1, text: 'Vendor may, at its sole discretion, obtain insurance covering risks of loss/damage to the RTS System (any part thereof) during transit from Vendor’s warehouse until delivery to the Applicant Site and until installation and commissioning.', alignment: 'justify' },
                  { counter: 9.2, text: 'Thereafter, all risk shall pass on to the Applicant and the Applicant may accordingly procure relevant insurances.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'CANCELLATION:', fontSize: 14, bold: true },
              {
                ol: [
                  {
                    counter: 10.1,
                    text: [
                      { text: 'The Applicant may cancel the order placed on Vendor within 7 (seven) days from the date of remittance of advance money or the date of order acceptance, whichever is earlier (“' },
                      { text: 'Order Confirmation', bold: true },
                      { text: '”) by serving notice as per Clause 13.' },
                    ]
                  },
                  { counter: 10.2, text: 'If the Applicant cancels the order after the expiry of 7 (seven) days from the date of Order Form, the Applicant shall be liable to pay Vendor, a cancellation fee of XX% of the total order value plus costs and expenses incurred by Vendor, including, costs for labour, design, return of products, administrative costs, subvention costs.', alignment: 'justify' },
                  { counter: 10.3, text: 'Notwithstanding the aforesaid, the Applicant shall not be entitled to cancel the Order Form after Vendor has dispatched the RTS System (or any part thereof, including BOS) to the Applicant Site. If Applicant chooses to terminate the Order Form after dispatch, the entire amount paid by the Applicant till date, shall be forfeited by Vendor.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'LIMITATION OF LIABILITY AND INDEMNITY:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 11.1, text: 'To the extent that terms implied by law apply to the RTS System and the services rendered under this Agreement, Vendor’s liability for any breach of those terms is limited to:', alignment: 'justify' },
                  {
                    type: 'lower-alpha',
                    separator: ['(', ')'],


                    ol: [
                      { text: 'repairing or replacing the RTS System/any part thereof, as applicable; or', alignment: 'justify' },
                      { text: 'Refund of the moneys paid by the Applicant to Vendor, if Vendor cannot fulfil the order.', alignment: 'justify' },
                    ]
                  },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'SUSPENSION AND TERMINATION:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 12.1, text: 'If the Applicant fails to pay any sum due under this Agreement on the due date, Vendor may, in addition to its other rights under this Agreement, suspend its obligations under this Agreement until all outstanding amounts (including interest due) are paid.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'NOTICES:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 13.1, text: 'Any notice or other communication under this Agreement to Vendor and or to the Applicant, shall be in writing, in English language and shall be delivered or sent: (a) by electronic mail and/or (b) by hand delivery or registered post/courier, at the registered address of Applicant/Vendor.', alignment: 'justify' },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'FORCE MAJEURE EVENT:', fontSize: 14, bold: true },
              {


                ol: [

                  {
                    counter: 14.1,
                    text: [
                      { text: 'Neither Party shall be in default due to any delay or failure to perform its/his/her/their obligations under this Agreement which arises from or is a consequence of occurrence of an event which is beyond the reasonable control of such Party, and which makes performance of its/his/her/their obligations under this Agreement impossible or so impractical as reasonably to be considered impossible in the circumstances, and includes, but is not limited to, war, riot, civil disorder, earthquake, fire, explosion, storm, flood or other adverse weather conditions, pandemic, epidemic, embargo, strikes, lockouts, labour difficulties, other industrial action, acts of government, unavailability of equipment from vendor, changes requested by the Applicant (“' },
                      { text: 'Force Majeure Event', bold: true },
                      { text: '”) ' },
                    ]
                  },
                ]
              },
            ]
          },
          {
            fontSize: 11,
            margin: [0, 10, 0, 10],
            stack: [
              { text: 'GOVERNING LAW AND DISPUTE RESOLUTION:', fontSize: 14, bold: true },
              {


                ol: [
                  { counter: 15.1, text: 'The interpretation and enforcement of this Agreement shall be governed by the laws of India', alignment: 'justify' },
                  {
                    counter: 15.2,
                    text: [
                      { text: 'In the event of any dispute, controversy or difference between the Parties arising out of, or relating to this Agreement (“' },
                      { text: 'Dispute', bold: true },
                      { text: '”), both Parties shall make an effort to resolve the Dispute in good faith, failing which, any Party to the Dispute shall be entitled to refer the Dispute to arbitration to resolve the Dispute in the manner set out in this Clause. The rights and obligations of the Parties under this Agreement shall remain in full force and effect pending the award in such arbitration proceeding.' },
                    ]
                  },
                  { counter: 15.3, text: 'The arbitration proceeding shall be governed by the provisions of the Arbitration and Conciliation Act, 1996 and shall be settled by a sole arbitrator mutually appointed by the Parties.', alignment: 'justify' },
                ]
              },
            ]
          },
        ]
      },



      {
        margin: [0, 50, 0, 0],
        alignment: 'left',
        columns: [

          {
            alignment: 'left',
            fontSize: 11,
            margin: [40, 10, 0, 10],
            stack: [
              {
                image: 'customerSign',
                width: 100,
                height: 60,
                alignment: 'left',
              },
              { text: name, bold: true, alignment: 'left' },
              { text: 'Applicant', alignment: 'left' },
              { text: '\n\nWitness', alignment: 'left' },
              { text: '\n1\n\n\n\n', alignment: 'left' },
              { text: '2', alignment: 'left' },
            ]
          },


          [
            {
              image: 'signImg',
              width: 100,
              height: 60,
              alignment: 'center',
            },
            { text: companyModel.companyName + '\n(Vendor) ', alignment: 'center' },
          ],


        ]
      },
    ];
  }

  public getSolarAgreementPDFData(solarAgreementModel: SolarAgreementModel, electricityBoard, productsMap, selectedCustomer, companyModel, brandMap) {
    const agreementDate = formatDate(solarAgreementModel.agreementDate, settings.SHOW_DATE_FORMAT, 'en');
    const solarProduct = productsMap.get(solarAgreementModel.solarModelId);
    const inverterProduct = productsMap.get(solarAgreementModel.inverterModelId);

    return [
      { text: 'Annexure 2', alignment: 'center', bold: true, margin: [0, 370, 0, 0] },
      '\n',
      { text: 'Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM - Surya Ghar: Muft Bijli Yojana', alignment: 'center', bold: true },
      '\n',
      { text: ['This agreement is executed on ', { text: agreementDate, bold: true }, ' for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana'], alignment: 'justify' },
      '\n',
      { text: 'Between', alignment: 'center', bold: true },
      '\n',
      { text: [{ text: selectedCustomer.name, bold: true }, { text: ' having address at ' }, { text: selectedCustomer.address + ', ' + selectedCustomer.district + '-' + selectedCustomer.pinCode, bold: true }, { text: ' (hereinafter referred to as first Party i.e. /consumer/consumer/purchaser /owner of system).' }], alignment: 'justify' },
      '\n',
      { text: 'And', alignment: 'center', bold: true },
      '\n',
      { text: [{ text: companyModel.companyName, bold: true }, { text: ' having registered office at ' }, { text: companyModel.address + ', ' + companyModel.district + '-' + companyModel.pinCode, bold: true }, { text: '(hereinafter referred to as second Party i.e. Vendor/ contractor/System Integrator).' }], alignment: 'justify' },
      '\n',
      { text: 'Whereas', bold: true },
      '\n',
      { text: 'First Party wishes to install a Grid Connected Rooftop Solar Plant on the rooftop of the residential building of the Consumer under PM Surya Ghar: Muft Bijli Yojana.', alignment: 'justify', pageBreak: 'after' },
      { text: 'And whereas', bold: true },
      '\n',
      { text: 'Second Party has verified availability of appropriate roof and found it feasible to install a Grid Connected Roof Top Solar plant and that the second party is willing to design, supply, install, test, commission and carry out Operation & Maintenance of the Rooftop Solar plant for 5 year period', alignment: 'justify' },
      { text: 'On this day, the First Party and Second Party agree to the following:', alignment: 'justify' },

      {
        fontSize: 11,
        margin: [0, 10, 0, 10],
        stack: [
          { text: 'The First Party hereby undertakes to perform the following activities:', margin: [0, 10, 0, 10], fontSize: 12, decoration: 'underline', bold: true },
          {
            ol: [
              { text: 'Submission of online application at National Portal for installation of RTS project/system, Submission of application for net-metering and system inspection and upload of the relevant documents on the National Portal of the scheme', alignment: 'justify', lineHeight: 1.5 },
              { text: 'Provide secure storage of the material of the RTS plant delivered at the premises till handover of the system.', alignment: 'justify', lineHeight: 1.5 },
              { text: 'Provide access to the Roof Top during installation of the plant, operation & maintenance, testing of the plant and equipment and for meter reading from solar meter, inverter etc.', alignment: 'justify', lineHeight: 1.5 },
              { text: 'Provide electricity during plant installation and water for cleaning of the panels.', alignment: 'justify', lineHeight: 1.5 },
              { text: 'Report any malfunctioning of the plant to the Vendor during the warranty period.', alignment: 'justify', lineHeight: 1.5 },
              { text: 'Pay the amount as per the payment schedule as mutually agreed with the vendor, including any additional amount to the second party for any additional work /customization required depending upon the building condition', alignment: 'justify', lineHeight: 1.5 },

            ]
          },
        ]
      },

      {
        fontSize: 11,
        margin: [0, 10, 0, 10],
        stack: [
          { text: 'The Second Party hereby undertakes to perform the following activities:', margin: [0, 10, 0, 10], decoration: 'underline', bold: true },

          {
            ol: [
              { text: ['The Vendor must follow all the standards and safety guidelines prescribed under state regulations and technical standards prescribed by MNRE for RTS projects, failing which the vendor is liable for blacklisting from participation in the govt. project/ scheme and other penal actions in accordance with the law. The responsibility of supply, installation and commissioning of the rooftop solar project/system in complete compliance with MNRE scheme guidelines lies with the Vendor.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Site Survey:', fontSize: 12, bold: true }, ' Site visit, survey and development of detailed project report for installation of RTS system. This also includes, feasibility study of roof, strength of roof and shadow free area. If any additional work or customization is involved for the plant installation as per site condition and requirement of the consumer building, the Vendor shall prepare an estimate and can raise separate invoice including GST in addition to the amount towards standard plant cost. The consumer shall pay the amount for such additional work directly to the Vendor.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Design & Engineering:', fontSize: 12, bold: true }, ' Design of plant along with drawings and selection of components as per standard provided by the DISCOM/SERC/MNRE for best performance and safety of the plant.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Module and Inverter:', fontSize: 12, bold: true }, ' The solar modules, including the solar cells, should be manufactured in India. Both the solar modules and inverters shall conform to the relevant standards and specifications prescribed by MNRE. Any other requirement, viz. star labelling (solar modules), quality control orders and standards & labelling (inverters) etc., shallalso be complied.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Procurement & Supply:', fontSize: 12, bold: true }, ' Procurement of complete system as per BIS/IS/IEC standard (whatever applicable) & safety guidelines for installation of rooftop solar plants. The supplied materials should comply with all MNRE standards for release of subsidy.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Installation & Civil work:', fontSize: 12, bold: true }, ' Complete civil work, structure work and electrical work (including drawings) following all the safety and relevant BIS standards.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Documentation (Technical Catalogues/Warranty Certificates/BIS certificates/other test reports etc):', fontSize: 12, bold: true }, ' All such documents shall be provided to the consumer for online uploading and submission of technical specifications, IEC/BIS report, Sr. Nos, Warranty card of Solar Panel & Inverter, Layout & Electrical SLD, Structure Design and Drawing, Cable and other detailed documents.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Project completion report (PCR):', fontSize: 12, bold: true }, ' Assisting the consumer in filling and uploading ofsigned documents (Consumer & Vendor) on the national portal.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Warranty:', fontSize: 12, bold: true }, ' System warranty certificates should be provided to the consumer. The complete system should be warranted for 5 years from the date of commissioning by DISCOM. Individual component warranty documents provided by the manufacturer shall be provided to the consumer and all possible assistance should be extended to the consumer for claiming the warranty from the manufacturer.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'NET meter & Grid Connectivity:', fontSize: 12, bold: true }, ' Net meter supply/procurement, testing and approvals shall be in the scope of vendor. Grid connection of the plant shall be in the scope of the vendor.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Testing and Commissioning:', fontSize: 12, bold: true }, ' The vendor shall be present at the time of testing and commissioning by the DISCOM.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Operation & Maintenance:', fontSize: 12, bold: true }, ' Five (5) years Comprehensive Operation and Maintenance including overhauling, wear and tear and regular checking of healthiness of system at proper interval shall be in the scope of vendor. The vendor shall also educate the consumer on best practices for cleaning of the modules and system maintenance.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: ' Insurance:', fontSize: 12, bold: true }, ' Any insurance cost pertaining to material transfer/storage before commissioning of the system shall be in the scope of the vendor.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Applicable Standard:', bold: true }, ' The system must meet the technical standards and specifications notified by MNRE. The vendor is solely responsible to supply component and service which meets the technical standards and specification prescribed by MNRE and State DISCOMs.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: ' Project/system cost & payment terms:', fontSize: 12, bold: true }, ' The cost of the plant and payment schedule should be mutually discussed and decided between the vendor and consumer. The consumer may opt for milestone-based payment to the vendor and the same shall be included in the agreement.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Dispute: ', fontSize: 12, bold: true }, 'In-case of any dispute between consumer and vendor (in supply/installation/maintenance of system or payment terms), both parties must settle the same mutually or as per law. MNRE/DISCOM shall not be liable for, and would not be a party to any dispute arising between vendor and consumer.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Subsidy / Project Related Documents:', fontSize: 12, bold: true }, ' Vendor must provide all the documents to consumer and help in uploading the same to National Portal for smooth release of subsidy.'], alignment: 'justify', lineHeight: 1.5 },
              { text: [{ text: 'Performance of Plant:', fontSize: 12, bold: true }, ' The Performance Ratio (PR) of Plant must be 75% at the time of commissioning of the project by DISCOM or its authorised agency. Vendor must provide (returnable basis) radiation sensor with valid calibration certificate of any NABL / International laboratory at the time of commissioning/ testing of the plant. Vendor must maintain the PR of the plant till warranty of project i.e. 5 years from the date of commissioning'], alignment: 'justify', lineHeight: 1.5 },
              { text: ['Mutually Agreed Terms of Payment...'], bold: true },
            ]
          },
        ]
      },

      {
        alignment: 'left',
        columnGap: 20,
        columns: [

          [
            { text: 'First Party', bold: true, margin: [0, 0, 0, 20], },
            { text: [{ text: 'NAME : ' }, { text: selectedCustomer.name, bold: true }], alignment: 'justify', lineHeight: 1.5 },
            { text: [{ text: 'Address : ' }, { text: selectedCustomer.address + ', ' + selectedCustomer.district + '-' + selectedCustomer.pinCode, bold: true }], alignment: 'justify', lineHeight: 1.5 },
            { text: [{ text: 'Sign : ' }], alignment: 'justify', lineHeight: 1.5 },
            {
              image: 'customerSign',
              width: 100,
              height: 60,
              alignment: 'left',
            },
            { text: [{ text: 'Date : ' }, { text: agreementDate, bold: true }], alignment: 'justify', lineHeight: 1.5 },

          ],

          [
            { text: 'Second Party', bold: true, margin: [0, 0, 0, 20] },

            { text: [{ text: 'NAME : ' }, { text: companyModel.companyName, bold: true }], alignment: 'justify', lineHeight: 1.5 },
            { text: [{ text: 'Address : ' }, { text: companyModel.address + ', ' + companyModel.district + '-' + companyModel.pinCode, bold: true }], alignment: 'justify', lineHeight: 1.5 },

            { text: [{ text: 'Sign : ' }], alignment: 'justify', lineHeight: 1.5 },


          ],


        ]
      },


    ];
  }


}
