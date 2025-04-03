import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';


export async function POST(request: NextRequest,response:NextResponse) {
    
  const data:any = await request.json();
  console.log("data", data);
  const firmName = data?.firmName || "";
  const firmAddress = data?.firmAddress || "";
  const invoiceNumber = data?.invoiceNumber || 1201;
  const currentDate = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format
  const logoBase64 = getBase64Image("datta_image.jpg");
  type Item = { particular: string; qty:number,rate:number,price: number };

  var itemDetails:string = "";
  let number=1;
  let total:number=0;
  data.items.forEach((ele:Item) => {
    console.log(ele);
    const price = ele.qty * ele.rate;
    total+=price;
    itemDetails=itemDetails.concat(`<tr>
                        <td>${number}</td>
                        <td>${ele.particular}</td>
                        <td>${ele.qty}</td>
                        <td>${ele.rate}</td>
                        <td>${price}</td>
                    </tr>`);
  });

  console.log(itemDetails);
  var markupText = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Gaurav Enterprises</title>
    <style>
    @media print {
       @page {
          margin: 0; /* Removes default margin */
          size: auto; /* Ensures full-page printing */
       }

        body {
          margin: 0;
          padding: 0;
       }
     }
        body {
            font-family: Arial, sans-serif;
        }
        .invoice-container {
            width: 700px;
            margin: auto;
            border: 2px solid red;
            padding: 20px;
        }
        .top-header{
            text-align: center;
            font-size: 14px;
            margin-left:50px;
            margin-right: 50px;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 24px;
            color: red;
            position: relative;
        }
        .header img {
            position: absolute;
            left: 20px;
            top: -10px;
            width: 100px;
            height: auto;
        }
        .sub-header {
            text-align: center;
            font-size: 14px;
            margin-left:50px;
            margin-right: 50px;
        }
        .info {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
        }
        .quotaion-text{
            text-align: center;
        }
        .table-container {
            margin-top: 20px;
            width: 100%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        .total {
            text-align: right;
            font-weight: bold;
            margin-top: 20px;
        }
        .signature {
            margin-top: 30px;
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="invoice-container">
        <div class="top-header">
            <strong> || Shri Bhairvanath Prasanna ||</strong>
        </div>
        <div class="header">
            <img src=${logoBase64} alt="img not found"> <!-- Replace with actual image file -->
            GAURAV ENTERPRISES
        </div>
        <div class="sub-header">
            Motor Rewinding with Maintenance | A/C, Fridge, Washing Machine,<br>Chiller & Home Appliances Repairing <br>
            Hingangada, Post-Roti, Tal. Daund, Dist. Pune <br>Mob: 9970957065, 9960928125
        </div>
        <br>
        <br>
        <div class="info">
            <div>
                <strong>M/s: ${firmName}</strong> <br>
                ${firmAddress}
            </div>
            <div>
                <strong>No:</strong> ${invoiceNumber} <br>
                <strong>Date:</strong> ${currentDate}
            </div>
        </div>
        <h2 class="quotaion-text"> Quotation </h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>S. No</th>
                        <th>PARTICULARS</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount Rs.</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemDetails}
                </tbody>
            </table>
        </div>

        <div class="total">
            <strong>Total: ${total}/-</strong> <br>
            <em>In words: ${numberToWords(total)} only.</em>
        </div>

        <div class="signature">
            For Gaurav Enterprises <br><br>
            ____________________________
        </div>
    </div>

</body>
</html>`;

  console.log(markupText);
// Set headers to indicate it's a PDF download
//return new NextResponse(pdfBuffer.toBuffer(), { headers });
  return NextResponse.json({ message: "data received", htmlData:markupText  });
}


function getBase64Image(filePath: string): string {
    const imagePath = path.join(process.cwd(), 'public', filePath);
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  }

function numberToWords(num:number) {
    if (num === 0) return "Zero";

    const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousandUnits = ["", "Thousand", "Million", "Billion"];

    function convertChunk(n:number) :string{
        if (n === 0) return "";
        else if (n < 20) return belowTwenty[n] + " ";
        else if (n < 100) return tens[Math.floor(n / 10)] + " " + convertChunk(n % 10);
        else return belowTwenty[Math.floor(n / 100)] + " Hundred " + convertChunk(n % 100);
    }

    let result = "";
    let i = 0;

    while (num > 0) {
        if (num % 1000 !== 0) {
            result = convertChunk(num % 1000) + thousandUnits[i] + " " + result;
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return result.trim();
}

