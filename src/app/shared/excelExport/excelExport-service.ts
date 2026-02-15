import { Injectable } from '@angular/core';

import { Workbook } from 'exceljs';
import * as fs from 'file-saver';


@Injectable({
    providedIn: 'root'
})
export class ExcelExportService {

    constructor() {
    }

    exportExcel(columns: any[], data: string[][], filename, worksheetName, postData = []) {
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(worksheetName);
        worksheet.columns = columns;

        data.forEach(row => {
            let exlRow = worksheet.addRow(row, "n");
            for (let i = 1; i <= row.length; i++) {
                exlRow.getCell(i).style = this.dataStyle;
            }
        });

        for (let i = 1; i <= columns.length; i++) {
            worksheet.getRow(1).getCell(i).style = this.HeaderStyle;
        }

        if (postData.length > 0) {
            let exlRow = worksheet.addRow(postData, "n");
            for (let i = 1; i <= columns.length; i++) {
                exlRow.getCell(i).style = this.FooterStyle;
                exlRow.getCell(i).merge
            }
        }

        workbook.xlsx.writeBuffer().then((data1) => {
            let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, filename + '.xlsx');
        })
    }


    exportExcel1(columns: any[][], data: string[][], filename, worksheetName, postData = []) {
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(worksheetName);

        data.forEach(row => {
            let exlRow = worksheet.addRow(row, "n");
            for (let i = 1; i <= row.length; i++) {
                exlRow.getCell(i).style = this.dataStyle;
            }
        });

        if (postData.length > 0) {
            let exlRow = worksheet.addRow(postData, "n");
            for (let i = 1; i <= columns.length; i++) {
                exlRow.getCell(i).style = this.FooterStyle;
            }
        }

        workbook.xlsx.writeBuffer().then((data1) => {
            let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, filename + '.xlsx');
        })
    }

    HeaderStyle: any = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f4bf42' }
        },
        font: {
            bold: true,
           
        },
        alignment: { horizontal: 'center' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    }

    FooterStyle: any = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '8150f2' }
        },
        font: {
            bold: true,
            color: { argb: 'ffffff' }
        },
        alignment: { horizontal: 'center' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    }

    dataStyle: any = {
        alignment: {  wrapText: true, horizontal: 'center' },
    }

}