import fs from "fs";
// import pdfParse from "pdf-parse/lib/pdf-parse.js";

// 🕒 Time tool
export function getTime() {
  return new Date().toString();
}

// 📄 Read TXT
export function readTxt(path) {
  return fs.readFileSync(path, "utf-8");
}

// 📘 Read PDF
// export async function readPdf(path) {
//   const buffer = fs.readFileSync(path);
//   const data = await pdfParse(buffer);
//   return data.text;
// }
