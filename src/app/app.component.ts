import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface BomResult {
  partNumber: string;
  digikeyUrl: string;
  quantity: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Personal Information
  name = 'Maheep Bhatt';
  title = 'PhD Candidate in Electrical Engineering';
  email = 'mbhatt2@wisc.edu';
  location = 'Madison, WI';

  // Social Links
  linkedinUrl = 'https://www.linkedin.com/in/maheep-bhatt';
  instagramUrl = 'https://instagram.com/yourhandle';

  // About section
  aboutMe = `I am a PhD student in Electrical and Computer Engineering at the University of Wisconsin–Madison (WEMPEC), working on advanced power electronics and motor-drive systems. My research focuses on current source inverter (CSI) architectures and wide-bandgap devices, particularly SiC MOSFET and GaN based bidirectional switches, with emphasis on high-frequency converter design, gate drives, and experimental characterization. I combine simulation-driven design with hands-on hardware development to create efficient, practical power-electronic solutions for electric vehicles, UPS, and energy systems.`;

  // Skills with icons
  skills = [
    { name: 'MATLAB', icon: 'matlab', type: 'software' },
    { name: 'Simulink', icon: 'simulink', type: 'software' },
    { name: 'LTspice', icon: 'ltspice', type: 'software' },
    { name: 'PSIM', icon: 'psim', type: 'software' },
    { name: 'PLECS', icon: 'plecs', type: 'software' },
    { name: 'SIMBA', icon: 'simba', type: 'software' },
    { name: 'Altium Designer', icon: 'altium', type: 'software' },
    { name: 'Arduino', icon: 'arduino', type: 'software' },
    { name: 'Python', icon: 'python', type: 'software' },
    { name: 'Power Electronics', icon: 'power', type: 'domain' },
    { name: 'GaN Devices', icon: 'chip', type: 'domain' },
    { name: 'SiC Switches', icon: 'chip', type: 'domain' },
    { name: 'Inverter Design', icon: 'inverter', type: 'domain' },
    { name: 'Gate Drivers', icon: 'circuit', type: 'domain' },
    { name: 'EV Systems', icon: 'ev', type: 'domain' },
    { name: 'PCB Design', icon: 'pcb', type: 'domain' }
  ];

  // Education
  education = [
    {
      degree: 'Ph.D. Electrical Engineering',
      institution: 'University of Wisconsin-Madison',
      year: 'January 2024 - Present',
      description: 'Advisor: Dr. Bulent Sarlioglu. Research focus on power electronics and electric drives at WEMPEC.'
    },
    {
      degree: 'M.S. Electrical Engineering',
      institution: 'University of Wisconsin-Madison',
      year: '2021 - 2023',
      description: 'Courses: Solid-state power conversion, Electric drive systems, Power electronics circuits, Computer modeling and simulation of autonomous vehicles.'
    },
    {
      degree: 'B.S. Electrical and Electronics Engineering',
      institution: 'Vellore Institute of Technology, Chennai, India',
      year: '2017 - 2021',
      description: 'Foundation in electrical and electronics engineering principles.'
    }
  ];

  // Experience
  experience = [
    {
      position: 'Research Assistant & Teaching Assistant',
      company: 'WEMPEC, University of Wisconsin-Madison',
      period: '2023 - Present',
      description: 'Fabricated and tested gate drivers for GaN bidirectional switches. Evaluated performance of GaN bidirectional switches. Developed fault detection techniques for Current Source Inverters (CSIs). Performed comparisons of VSI and CSI for traction drive applications. Instructed industry professionals in short courses.'
    },
    {
      position: 'R&A Power Electronics Intern',
      company: 'Ford, Dearborn, MI',
      period: 'May 2025 - August 2025',
      description: 'Led simulation-based design and analysis of a CSI and a single-stage buck-boost inverter. Conducted double pulse testing of SiC switches.'
    },
    {
      position: 'Inverter System Design Engineering Student',
      company: 'Magna Powertrain, Troy, MI',
      period: 'May 2022 - December 2022',
      description: 'Designed passive and active discharge circuits. Calculated conduction and switching losses for power modules. Utilized Altium to craft 2D schematics for Interface and Deskew fixture boards.'
    },
    {
      position: 'Summer Intern',
      company: 'Siemens R&D Department of Mobility, Mumbai, India',
      period: 'May 2019 - June 2019',
      description: 'Analyzed components including audio frequency track circuits, axle counters, and point machines used by Indian Railways. Developed circuits for signal interlocking systems.'
    }
  ];

  // Research Projects
  researchProjects = [
    {
      title: 'Comparison of VSI and CSI for Traction Drive Applications',
      icon: 'inverter',
      highlights: [
        'Simulation closed modeling of the three inverters',
        'Double pulse testing of the switch for both inverters',
        'Loss modeling of Voltage Source Inverter and Current Source Inverter'
      ]
    },
    {
      title: 'Performance Evaluation of GaN Bidirectional Switches',
      icon: 'chip',
      highlights: [
        'Understood the working of the Gate driver circuit for GaN Bidirectional Switches from Infineon',
        'Designed and fabricated the Gate Driver circuit for the BD switches',
        'Performing tests for the circuit for the BD switches'
      ]
    },
    {
      title: 'Fault Detection for Current Source Inverters',
      icon: 'circuit',
      highlights: [
        'Objective: Prevent the open circuit faults in current source inverters',
        'Developed detection algorithms for fault conditions',
        'Implemented protection mechanisms for CSI systems'
      ]
    },
    {
      title: 'Front-end DC-DC Converter for Current Source Inverters',
      icon: 'power',
      highlights: [
        'Reducing voltage stress across front-end DC-DC converter switches by half',
        'Improving overall efficiency of combined front-end DC-DC converter and CSI system',
        'Optimizing converter topology for EV applications'
      ]
    }
  ];

  // PCB Designs
  pcbDesigns = [
    {
      title: 'GaN Gate Driver Board',
      description: 'High-frequency gate driver for GaN bidirectional switches with isolated power supply',
      features: ['4-layer PCB', 'Isolated gate drive', 'High-speed switching']
    },
    {
      title: 'Double Pulse Test Board',
      description: 'Test fixture for characterizing SiC and GaN power devices',
      features: ['Low inductance layout', 'Current sensing', 'Voltage probing']
    },
    {
      title: 'CSI Control Board',
      description: 'Digital control board for current source inverter applications',
      features: ['DSP-based control', 'PWM generation', 'Protection circuits']
    },
    {
      title: 'DC-DC Converter Board',
      description: 'High-efficiency front-end converter for CSI systems',
      features: ['Multi-layer design', 'Thermal management', 'EMI filtering']
    }
  ];

  // Tools
  tools = [
    { name: 'Altium Designer', category: 'PCB Design', description: 'Multi-layer PCB design and layout' },
    { name: 'MATLAB/Simulink', category: 'Simulation', description: 'System modeling and control design' },
    { name: 'PLECS', category: 'Simulation', description: 'Power electronics circuit simulation' },
    { name: 'LTspice', category: 'Simulation', description: 'SPICE-based circuit analysis' },
    { name: 'PSIM', category: 'Simulation', description: 'Power converter simulation' },
    { name: 'Ansys', category: 'Analysis', description: 'Thermal and electromagnetic analysis' },
    { name: 'Oscilloscope', category: 'Lab Equipment', description: 'Waveform capture and analysis' },
    { name: 'Power Analyzer', category: 'Lab Equipment', description: 'Efficiency and power measurements' }
  ];

  // Publications
  publications = [
    {
      title: 'Reduced-Order Modeling of PM Motors for PWM Loss Estimation in VSI, T-type MVSI, and CSI Drive',
      journal: 'ECCE',
      year: '2025',
      link: '#'
    },
    {
      title: 'Design Optimization and Validation of the Hybrid Upper H-Arm Suspension link of a BAJA All-Terrain Vehicle using Finite Element Analysis and Accelerometer Validation Setup',
      journal: 'International Journal of Scientific Research in Engineering and Management',
      year: '2021',
      link: '#'
    },
    {
      title: 'Design of 3D Printed Integrated Leg Flap System and Embedded Control for Amphibious Hexapod with provision for Piezoelectric Energy Harvesting',
      journal: 'International Research Journal of Engineering and Technology',
      year: '2021',
      link: '#'
    }
  ];

  currentYear = new Date().getFullYear();

  // Mobile menu state
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSectionMobile(sectionId: string): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }

  // BOM Tool properties
  isDragOver = false;
  bomColumns: string[] = [];
  selectedColumn = '';
  selectedQuantityColumn = '';
  bomData: any[] = [];
  bomResults: BomResult[] = [];
  bomMessage = '';
  bomMessageType: 'error' | 'success' | '' = '';
  isCreatingCart = false;
  digiKeyCartUrl = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    this.bomMessage = '';
    this.bomMessageType = '';
    this.bomResults = [];
    this.bomColumns = [];
    this.selectedColumn = '';
    this.selectedQuantityColumn = '';
    this.digiKeyCartUrl = '';

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      this.bomMessage = 'Please upload a valid Excel file (.xlsx, .xls, .csv)';
      this.bomMessageType = 'error';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          this.bomMessage = 'The file appears to be empty';
          this.bomMessageType = 'error';
          return;
        }

        // First row is headers
        const headers = jsonData[0] as string[];
        this.bomColumns = headers.filter(h => h && h.toString().trim() !== '');

        // Store remaining data
        this.bomData = jsonData.slice(1);

        // Auto-detect part number column
        const partNumberPatterns = ['part number', 'part no', 'partno', 'mpn', 'manufacturer part', 'mfr part', 'p/n', 'pn', 'comment', 'libref', 'value'];
        const autoDetectedCol = this.bomColumns.find(col =>
          partNumberPatterns.some(pattern => col.toLowerCase().includes(pattern))
        );

        // Auto-detect quantity column
        const quantityPatterns = ['quantity', 'qty', 'count', 'amount'];
        const autoDetectedQtyCol = this.bomColumns.find(col =>
          quantityPatterns.some(pattern => col.toLowerCase().includes(pattern))
        );

        if (autoDetectedCol) {
          this.selectedColumn = autoDetectedCol;
        }
        if (autoDetectedQtyCol) {
          this.selectedQuantityColumn = autoDetectedQtyCol;
        }
        if (autoDetectedCol) {
          this.processSelectedColumn();
        }

        this.bomMessage = `File loaded successfully. Found ${this.bomColumns.length} columns and ${this.bomData.length} rows.`;
        this.bomMessageType = 'success';
      } catch (error) {
        this.bomMessage = 'Error reading file. Please ensure it is a valid Excel file.';
        this.bomMessageType = 'error';
      }
    };

    reader.readAsArrayBuffer(file);
  }

  processSelectedColumn(): void {
    if (!this.selectedColumn) {
      this.bomResults = [];
      return;
    }

    this.digiKeyCartUrl = ''; // Reset cart URL when columns change

    const colIndex = this.bomColumns.indexOf(this.selectedColumn);
    if (colIndex === -1) return;

    const qtyColIndex = this.selectedQuantityColumn
      ? this.bomColumns.indexOf(this.selectedQuantityColumn)
      : -1;

    // Build a map of part numbers to quantities
    const partQuantityMap = new Map<string, number>();

    this.bomData.forEach(row => {
      const partNumber = row[colIndex];
      if (partNumber && partNumber.toString().trim() !== '') {
        const pn = partNumber.toString().trim();
        let qty = 1;
        if (qtyColIndex !== -1 && row[qtyColIndex]) {
          const parsedQty = parseInt(row[qtyColIndex].toString(), 10);
          qty = isNaN(parsedQty) ? 1 : parsedQty;
        }
        // Aggregate quantities for duplicate part numbers
        partQuantityMap.set(pn, (partQuantityMap.get(pn) || 0) + qty);
      }
    });

    this.bomResults = Array.from(partQuantityMap.entries()).map(([pn, qty]) => ({
      partNumber: pn,
      digikeyUrl: `https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(pn)}`,
      quantity: qty
    }));
  }

  copyAllLinks(): void {
    const links = this.bomResults.map(r => `${r.partNumber}\t${r.quantity}\t${r.digikeyUrl}`).join('\n');
    navigator.clipboard.writeText(links).then(() => {
      this.bomMessage = 'All links copied to clipboard!';
      this.bomMessageType = 'success';
      setTimeout(() => {
        this.bomMessage = '';
        this.bomMessageType = '';
      }, 3000);
    });
  }

  async createDigiKeyCart(): Promise<void> {
    if (this.bomResults.length === 0 || !this.selectedQuantityColumn) {
      return;
    }

    this.isCreatingCart = true;
    this.digiKeyCartUrl = '';
    this.bomMessage = '';
    this.bomMessageType = '';

    try {
      // Generate CSV content for DigiKey BOM Manager
      // This allows users to select packaging (Cut Tape vs Tape & Reel)
      const csvLines = ['Quantity,Part Number'];
      this.bomResults.forEach(item => {
        csvLines.push(`${item.quantity},"${item.partNumber}"`);
      });
      const csvContent = csvLines.join('\n');

      // Create downloadable CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'digikey_bom.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Set URL to DigiKey BOM Manager
      this.digiKeyCartUrl = 'https://www.digikey.com/BOM';
      this.bomMessage = 'CSV downloaded! Click below to open DigiKey BOM Manager, then upload the CSV file. You can select Cut Tape (CT) packaging for each part.';
      this.bomMessageType = 'success';
    } catch (error) {
      console.error('Error creating DigiKey cart:', error);
      this.bomMessage = `Failed to create DigiKey link: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.bomMessageType = 'error';
    } finally {
      this.isCreatingCart = false;
    }
  }

  // LaTeX Tool properties
  latexActiveTab: 'word-to-latex' | 'latex-to-word' = 'word-to-latex';
  isLatexDragOver = false;
  latexOutput = '';
  latexInput = '';
  latexMessage = '';
  latexMessageType: 'error' | 'success' | '' = '';
  currentFileName = 'document';

  onLatexDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLatexDragOver = true;
  }

  onLatexDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLatexDragOver = false;
  }

  onLatexDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLatexDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processWordFile(files[0]);
    }
  }

  onWordFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processWordFile(input.files[0]);
    }
  }

  async processWordFile(file: File): Promise<void> {
    this.latexMessage = '';
    this.latexMessageType = '';
    this.latexOutput = '';

    if (!file.name.endsWith('.docx')) {
      this.latexMessage = 'Please upload a .docx file';
      this.latexMessageType = 'error';
      return;
    }

    this.currentFileName = file.name.replace('.docx', '');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      // Convert HTML to LaTeX
      this.latexOutput = this.htmlToLatex(html);
      this.latexMessage = 'Conversion successful!';
      this.latexMessageType = 'success';
    } catch (error) {
      this.latexMessage = 'Error processing Word file. Please try again.';
      this.latexMessageType = 'error';
    }
  }

  htmlToLatex(html: string): string {
    let latex = html;

    // Document structure
    let preamble = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\begin{document}

`;

    // Convert headings
    latex = latex.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\\section{$1}\n');
    latex = latex.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\\subsection{$1}\n');
    latex = latex.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\\subsubsection{$1}\n');
    latex = latex.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\\paragraph{$1}\n');
    latex = latex.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\\subparagraph{$1}\n');
    latex = latex.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\\subparagraph{$1}\n');

    // Convert text formatting
    latex = latex.replace(/<strong>(.*?)<\/strong>/gi, '\\textbf{$1}');
    latex = latex.replace(/<b>(.*?)<\/b>/gi, '\\textbf{$1}');
    latex = latex.replace(/<em>(.*?)<\/em>/gi, '\\textit{$1}');
    latex = latex.replace(/<i>(.*?)<\/i>/gi, '\\textit{$1}');
    latex = latex.replace(/<u>(.*?)<\/u>/gi, '\\underline{$1}');
    latex = latex.replace(/<sup>(.*?)<\/sup>/gi, '\\textsuperscript{$1}');
    latex = latex.replace(/<sub>(.*?)<\/sub>/gi, '\\textsubscript{$1}');

    // Convert lists
    latex = latex.replace(/<ul[^>]*>/gi, '\\begin{itemize}\n');
    latex = latex.replace(/<\/ul>/gi, '\\end{itemize}\n');
    latex = latex.replace(/<ol[^>]*>/gi, '\\begin{enumerate}\n');
    latex = latex.replace(/<\/ol>/gi, '\\end{enumerate}\n');
    latex = latex.replace(/<li[^>]*>(.*?)<\/li>/gi, '  \\item $1\n');

    // Convert paragraphs
    latex = latex.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Convert line breaks
    latex = latex.replace(/<br\s*\/?>/gi, '\\\\\n');

    // Convert links
    latex = latex.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '\\href{$1}{$2}');

    // Remove remaining HTML tags
    latex = latex.replace(/<[^>]+>/g, '');

    // Escape special LaTeX characters (be careful not to double-escape)
    latex = latex.replace(/&amp;/g, '\\&');
    latex = latex.replace(/&lt;/g, '<');
    latex = latex.replace(/&gt;/g, '>');
    latex = latex.replace(/&nbsp;/g, ' ');
    latex = latex.replace(/%/g, '\\%');
    latex = latex.replace(/#/g, '\\#');
    latex = latex.replace(/\$/g, '\\$');

    // Clean up extra whitespace
    latex = latex.replace(/\n{3,}/g, '\n\n');
    latex = latex.trim();

    return preamble + latex + '\n\n\\end{document}';
  }

  copyLatexOutput(): void {
    navigator.clipboard.writeText(this.latexOutput).then(() => {
      this.latexMessage = 'LaTeX code copied to clipboard!';
      this.latexMessageType = 'success';
      setTimeout(() => {
        this.latexMessage = '';
        this.latexMessageType = '';
      }, 3000);
    });
  }

  downloadLatexFile(): void {
    const blob = new Blob([this.latexOutput], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${this.currentFileName}.tex`);
    this.latexMessage = 'LaTeX file downloaded!';
    this.latexMessageType = 'success';
  }

  async convertLatexToWord(): Promise<void> {
    if (!this.latexInput.trim()) {
      this.latexMessage = 'Please enter some LaTeX code';
      this.latexMessageType = 'error';
      return;
    }

    try {
      const paragraphs = this.parseLatexToDocx(this.latexInput);

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'converted-document.docx');

      this.latexMessage = 'Word document downloaded!';
      this.latexMessageType = 'success';
    } catch (error) {
      this.latexMessage = 'Error converting LaTeX. Please check your syntax.';
      this.latexMessageType = 'error';
    }
  }

  parseLatexToDocx(latex: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Remove preamble
    let content = latex;
    const beginDoc = content.indexOf('\\begin{document}');
    const endDoc = content.indexOf('\\end{document}');
    if (beginDoc !== -1) {
      content = content.substring(beginDoc + 16);
    }
    if (endDoc !== -1) {
      content = content.substring(0, content.indexOf('\\end{document}'));
    }

    // Split by sections and paragraphs
    const lines = content.split('\n');
    let currentText = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Handle sections
      const sectionMatch = trimmedLine.match(/\\section\{([^}]+)\}/);
      if (sectionMatch) {
        if (currentText.trim()) {
          paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
          currentText = '';
        }
        paragraphs.push(new Paragraph({
          text: sectionMatch[1],
          heading: HeadingLevel.HEADING_1
        }));
        continue;
      }

      const subsectionMatch = trimmedLine.match(/\\subsection\{([^}]+)\}/);
      if (subsectionMatch) {
        if (currentText.trim()) {
          paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
          currentText = '';
        }
        paragraphs.push(new Paragraph({
          text: subsectionMatch[1],
          heading: HeadingLevel.HEADING_2
        }));
        continue;
      }

      const subsubsectionMatch = trimmedLine.match(/\\subsubsection\{([^}]+)\}/);
      if (subsubsectionMatch) {
        if (currentText.trim()) {
          paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
          currentText = '';
        }
        paragraphs.push(new Paragraph({
          text: subsubsectionMatch[1],
          heading: HeadingLevel.HEADING_3
        }));
        continue;
      }

      // Handle itemize/enumerate
      const itemMatch = trimmedLine.match(/\\item\s*(.*)/);
      if (itemMatch) {
        if (currentText.trim()) {
          paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
          currentText = '';
        }
        paragraphs.push(new Paragraph({
          children: this.parseLatexText(itemMatch[1]),
          bullet: { level: 0 }
        }));
        continue;
      }

      // Skip environment markers
      if (trimmedLine.match(/\\begin\{|\\end\{|\\documentclass|\\usepackage/)) {
        continue;
      }

      // Empty line = new paragraph
      if (trimmedLine === '' && currentText.trim()) {
        paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
        currentText = '';
        continue;
      }

      currentText += ' ' + trimmedLine;
    }

    // Add remaining text
    if (currentText.trim()) {
      paragraphs.push(new Paragraph({ children: this.parseLatexText(currentText) }));
    }

    return paragraphs;
  }

  parseLatexText(text: string): TextRun[] {
    const runs: TextRun[] = [];
    let remaining = text.trim();

    // Simple regex-based parsing for bold, italic, underline
    const pattern = /\\textbf\{([^}]+)\}|\\textit\{([^}]+)\}|\\underline\{([^}]+)\}|\\emph\{([^}]+)\}|([^\\]+)/g;
    let match;

    while ((match = pattern.exec(remaining)) !== null) {
      if (match[1]) {
        // Bold
        runs.push(new TextRun({ text: match[1], bold: true }));
      } else if (match[2]) {
        // Italic
        runs.push(new TextRun({ text: match[2], italics: true }));
      } else if (match[3]) {
        // Underline
        runs.push(new TextRun({ text: match[3], underline: {} }));
      } else if (match[4]) {
        // Emph (italic)
        runs.push(new TextRun({ text: match[4], italics: true }));
      } else if (match[5]) {
        // Regular text - clean up any remaining LaTeX commands
        let cleanText = match[5]
          .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
          .replace(/\\\\/g, '\n')
          .replace(/\\&/g, '&')
          .replace(/\\%/g, '%')
          .replace(/\\#/g, '#')
          .replace(/\\\$/g, '$')
          .trim();
        if (cleanText) {
          runs.push(new TextRun({ text: cleanText }));
        }
      }
    }

    if (runs.length === 0) {
      runs.push(new TextRun({ text: text.trim() }));
    }

    return runs;
  }
}
