import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CompanyModel } from '../../company-settings/company.model';
import { PdfStyleModel } from '../common.models';
import { UtilsService } from '../services/utils.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    apiURL: string = environment.apiUrl;
    constructor(
        private utilsService: UtilsService,
    ) {
    }

    generatePDF(title: any, titleData: any[], tableData: any[][], tableStyle, pageOrientation, action, headerRow, postTableData: any[] = []) {
        this.utilsService.getPdfStyles().subscribe(pdfStyleModelList => {
            this.generateDocument(new CompanyModel({}), title, titleData, tableData, postTableData, pageOrientation, tableStyle, action, headerRow, pdfStyleModelList);
        });
    }

    async generateDocument(companyModel: CompanyModel, title: string, titleData, tableData: string[][], postTableData, pageOrientation, tableStyle, action, headerRow, pdfStyleModelList: PdfStyleModel[]) {
        let content: any[] = [];
        content = content.concat(this.getCompanyHeader(companyModel));

        content.push({
            text: title, style: 'sectionHeader'
        });


        titleData.forEach(row => {
            content.push(row);
        })

        content.push({
            style: 'tableExample',
            table: {
                headerRows: headerRow,
                body: tableData,
            }

        });

        postTableData.forEach(row => {
            content.push(row);
        });

        const docDefinition = {
            pageOrientation: pageOrientation,

            footer: {
                columns: [
                    { text: "This document is computer generated and does not require the Authorized signature or stamp in order to be considered valid", alignment: 'center' }
                ]
            },
            background: {
                columns: [
                    this.getbackgorundLogoPosition(pageOrientation)]
            },
            content: content,

            images: {
                logo: companyModel.logoImg ? this.apiURL + companyModel.logoImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
            },
            styles: this.getStyle(pdfStyleModelList, tableStyle)
        };


        if (action == 'download') {
            pdfMake.createPdf(docDefinition).download();
        } else if (action == 'print') {
            pdfMake.createPdf(docDefinition).print();
        } else {
            pdfMake.createPdf(docDefinition).open();
        }
    }

    generateInvoicePDF(title: any, companyModel, postTableData, tableStyle, pageOrientation, action) {
        this.utilsService.getPdfStyles().subscribe(pdfStyleModelList => {
            this.generateInvoice(companyModel, title, postTableData, pageOrientation, tableStyle, action, pdfStyleModelList);
        });
    }

    async generateInvoice(companyModel: CompanyModel, title: string, postTableData, pageOrientation, tableStyle, action, pdfStyleModelList: PdfStyleModel[]) {
        let content: any[] = [];
        content.push({
            text: title, style: 'sectionHeader'
        });
        postTableData.forEach(row => {
            content.push(row);
        });

        const docDefinition = {
            pageOrientation: pageOrientation,
            background: {
                columns: [
                    this.getbackgorundLogoPosition(pageOrientation)]
            },
            content: content,

            images: {
                logo: companyModel.logoImg ? this.apiURL + companyModel.logoImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
            },
            styles: this.getStyle(pdfStyleModelList, tableStyle)
        };


        if (action == 'download') {
            pdfMake.createPdf(docDefinition).download();
        } else if (action == 'print') {
            pdfMake.createPdf(docDefinition).print();
        } else {
            pdfMake.createPdf(docDefinition).open();
        }
    }

    generateProposalPDF(companyModel, postTableData, tableStyle, pageOrientation, action) {
        this.utilsService.getPdfStyles().subscribe(pdfStyleModelList => {
            this.generateProposal(companyModel, postTableData, pageOrientation, tableStyle, action, pdfStyleModelList);
        });
    }

    async generateProposal(companyModel: CompanyModel, postTableData, pageOrientation, tableStyle, action, pdfStyleModelList: PdfStyleModel[]) {
        let content: any[] = [];
        postTableData.forEach(row => {
            content.push(row);
        });
        const docDefinition = {
            pageOrientation: pageOrientation,
            pageMargins: [20, 80, 20, 70],
            header: {
                columns: [
                    {
                        image: 'logo',
                        width: 60,
                        height: 60,
                        alignment: 'right',
                        absolutePosition: { x: 40, y: 5 }
                    },

                ]
            },
            footer: {
                stack: [
                    { canvas: [{ type: 'line', x1: 10, y1: 0, x2: 550, y2: 0, lineWidth: 1 }] },
                    {
                        layout: 'noBorders',
                        table: {
                            widths: ['65%', '30%'],
                            body: [
                                [
                                    {
                                        columns: [
                                            { image: 'mobileIcon', width: 30, height: 30, },
                                            { text: companyModel.mobile + '\n' + companyModel.phoneNo, margin: [0, 5, 0, 0], style: 'subheaderLeft' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { image: 'mailIcon', width: 25, height: 25, },
                                            { text: companyModel.email, margin: [0, 8, 0, 0], style: 'subheaderLeft' }
                                        ]
                                    },
                                ],
                                [
                                    {
                                        colSpan: 2, columns: [
                                            { image: 'placeIcon', width: 30, height: 20, },
                                            { text: companyModel.address + ', ' + companyModel.district + '-' + companyModel.pinCode + ' (U.P.)', style: 'sectionHeader1', margin: [0, 5, 0, 0] }
                                        ]
                                    }
                                ]
                            ]
                        },
                    }
                ],
                margin: [30, 10, 0, 0]
            },
            background: {
                columns: [
                    this.getbackgorundLogoPosition(pageOrientation)]
            },
            content: content,

            images: {
                logo: companyModel.logoImg ? this.apiURL + companyModel.logoImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
                mobileIcon: await this.getBase64ImageFromURL("assets/images/mobile-icon.png"),
                placeIcon: await this.getBase64ImageFromURL("assets/images/place-icon.png"),
                mailIcon: await this.getBase64ImageFromURL("assets/images/mail-icon.png"),

            },
            styles: this.getStyle(pdfStyleModelList, tableStyle)
        };


        if (action == 'download') {
            pdfMake.createPdf(docDefinition).download();
        } else if (action == 'print') {
            pdfMake.createPdf(docDefinition).print();
        } else {
            pdfMake.createPdf(docDefinition).open();
        }
    }

    generateEstimatePDF(companyModel, postTableData, header, tableStyle, pageOrientation, action) {
        this.utilsService.getPdfStyles().subscribe(pdfStyleModelList => {
            this.generateEstimate(companyModel, postTableData, header, pageOrientation, tableStyle, action, pdfStyleModelList);
        });
    }

    async generateEstimate(companyModel: CompanyModel, postTableData, header, pageOrientation, tableStyle, action, pdfStyleModelList: PdfStyleModel[]) {
        let content: any[] = [];
        postTableData.forEach(row => {
            content.push(row);
        });
        const docDefinition = {
            pageOrientation: pageOrientation,
            pageMargins: [20, 100, 20, 70],
            header: header,
            
            content: content,

            images: {
                logo: companyModel.logoImg ? this.apiURL + companyModel.logoImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
                upiImg: companyModel.upiImg ? this.apiURL + companyModel.upiImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),

                mobileIcon: await this.getBase64ImageFromURL("assets/images/mobile-icon.png"),
                placeIcon: await this.getBase64ImageFromURL("assets/images/place-icon.png"),
                mailIcon: await this.getBase64ImageFromURL("assets/images/mail-icon.png"),

            },
            styles: this.getStyle(pdfStyleModelList, tableStyle)
        };


        if (action == 'download') {
            pdfMake.createPdf(docDefinition).download();
        } else if (action == 'print') {
            pdfMake.createPdf(docDefinition).print();
        } else {
            pdfMake.createPdf(docDefinition).open();
        }
    }

    generateCustomPDF(companyModel, postTableData, header, footer, pageMargin, background, customerSign, tableStyle, pageOrientation, action) {
        this.utilsService.getPdfStyles().subscribe(pdfStyleModelList => {
            this.downloadCustomPDF(companyModel, postTableData, header, footer, pageMargin, background, customerSign, pageOrientation, tableStyle, action, pdfStyleModelList);
        });
    }

    async downloadCustomPDF(companyModel: CompanyModel, postTableData, header, footer, pageMargin, background, customerSign, pageOrientation, tableStyle, action, pdfStyleModelList: PdfStyleModel[]) {
        let content: any[] = [];
        postTableData.forEach(row => {
            content.push(row);
        });
        if (background == undefined) {
            background = this.getbackgorundLogoPosition();
        }
        const docDefinition = {
            pageOrientation: pageOrientation,
            pageMargins: pageMargin,
            header: header,
            footer: footer,
            background: background,
            content: content,
            images: {
                logo: companyModel.logoImg ? this.apiURL + companyModel.logoImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
                upiImg: companyModel.upiImg ? this.apiURL + companyModel.upiImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
                signImg: companyModel.signImg ? this.apiURL + companyModel.signImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),
                signWithStampImg: companyModel.signWithStampImg ? this.apiURL + companyModel.signWithStampImg : await this.getBase64ImageFromURL("assets/images/blank_image.png"),

                customerSign: await this.getBase64ImageFromURL(customerSign ? customerSign : "assets/images/blank_image.png"),

                mobileIcon: await this.getBase64ImageFromURL("assets/images/mobile-icon.png"),
                placeIcon: await this.getBase64ImageFromURL("assets/images/place-icon.png"),
                mailIcon: await this.getBase64ImageFromURL("assets/images/mail-icon.png"),

            },
            styles: this.getStyle(pdfStyleModelList, tableStyle)
        };


        if (action == 'download') {
            pdfMake.createPdf(docDefinition).download();
        } else if (action == 'print') {
            pdfMake.createPdf(docDefinition).print();
        } else {
            pdfMake.createPdf(docDefinition).open();
        }
    }

    getStyle(pdfStyleModelList: PdfStyleModel[] = [], tableStyle = {}) {
        const pdfStyle = {

            schoolNameHeader1: {
                bold: true,
                decoration: 'underline',
                fontSize: 20,
                alignment: 'center',
                margin: [0, 0, 0, 5]
            },
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 0]
            },
            sectionHeader: {
                bold: true,
                fontSize: 10,
                alignment: 'center',
                margin: [0, 0, 0, 0]
            },
            sectionHeader1: {
                bold: true,
                fontSize: 14,
                alignment: 'left',
            },

            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center',
            },

            subheader: {
                fontSize: 9,
                alignment: 'center',
            },
            subheaderLeft: {
                fontSize: 9,
                alignment: 'left',
            },

            subheaderBold: {
                bold: true,
                fontSize: 9,
                alignment: 'center',
            },
            subheaderBoldLeft: {
                bold: true,
                fontSize: 9,
                alignment: 'left',
            },
            justifyStyle: {
                fontSize: 10,
                alignment: 'justify',
            },
            schoolDataHeader1: {
                fontSize: 8,
                alignment: 'center'
            },

            titleContent: {
                fontSize: 10,
                color: 'black',
                alignment: 'justify',
                margin: [0, 0, 0, 5]
            },

            tableExample: tableStyle,
        };

        pdfStyleModelList.forEach(pdfStyleModel => {
            const jsonObj2 = JSON.parse(pdfStyleModel.styleValue);
            pdfStyle[pdfStyleModel.name] = jsonObj2;
        });

        return pdfStyle;
    }

    getbackgorundLogoPosition(pageOrientation = 'portrait') {
        if (pageOrientation === 'landscape') {
            return {
                image: 'logo',
                width: 400,
                height: 400,
                opacity: 0.1,
                alignment: 'center',
                absolutePosition: { x: 10, y: 140 }
            }
        } else {
            return {
                image: 'logo',
                width: 500,
                height: 500,
                opacity: 0.1,
                alignment: 'center',
                absolutePosition: { x: 10, y: 200 }
            }
        }
    }

    getBase64ImageFromURL(url) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.setAttribute("crossOrigin", "anonymous");

            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");

                resolve(dataURL);
            };

            img.onerror = error => {
                reject(error);
            };

            img.src = url;
        });
    }

    getCompanyHeader(companyModel: CompanyModel, color = "black") {
        const content: any[] = [
            { text: companyModel.companyName, style: 'schoolNameHeader1', color: color },
            { text: companyModel.address, style: 'schoolDataHeader1', color: color },
            { text: companyModel.mobile + (companyModel.phoneNo ? " / " + companyModel.phoneNo : ''), style: 'schoolDataHeader1', color: color },
            { text: companyModel.website, style: 'schoolDataHeader1', color: color },
        ];
        return content;
    }

    getCompanyHeader1(companyModel: CompanyModel, color = "black") {
        const content: any[] = [
            {
                image: 'logo',
                width: 60,
                height: 60,
                alignment: 'left',
                absolutePosition: { x: 20, y: 17 }
            },
            { text: companyModel.companyName, style: 'schoolNameHeader', color: color },
            { text: companyModel.address, style: 'subheader', color: color },
            { text: companyModel.mobile + (companyModel.phoneNo ? " / " + companyModel.phoneNo : ''), style: 'subheader', color: color },
            { text: (companyModel.email ? "Email:- " + companyModel.email : '') + (companyModel.website ? " Website:- " + companyModel.website : '') + ' ', style: 'subheader', color: color },
        ];

        content.push({
            canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 3 }]
        });

        return content;
    }
}
