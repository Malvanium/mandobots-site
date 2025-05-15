declare module "pdfjs-dist/legacy/build/pdf" {
    import * as pdfjsLib from "pdfjs-dist";
    export = pdfjsLib;
  }
  
  declare module "pdfjs-dist/legacy/build/pdf.worker.entry" {
    const workerSrc: string;
    export default workerSrc;
  }
  