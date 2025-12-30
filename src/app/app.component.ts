import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class AppComponent implements OnInit, OnDestroy {
  // Expose Math to template
  Math = Math;

  // ==================== COVER PAGE WIDGETS ====================

  // Time Zone Clocks
  usaTime: Date = new Date();
  indiaTime: Date = new Date();
  private clockInterval: any = null;

  // Weather Widget
  weather = {
    location: 'Madison, WI',
    tempF: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    icon: 'partly-cloudy',
    feelsLikeF: 22,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 1018,
    visibility: 10,
    uvIndex: 2,
    dewPoint: 18,
    cloudCover: 45,
    sunrise: '7:23 AM',
    sunset: '4:32 PM'
  };

  // Temperature conversion helpers
  get tempC(): number {
    return Math.round((this.weather.tempF - 32) * 5 / 9);
  }

  get feelsLikeC(): number {
    return Math.round((this.weather.feelsLikeF - 32) * 5 / 9);
  }

  get dewPointC(): number {
    return Math.round((this.weather.dewPoint - 32) * 5 / 9);
  }

  // Progress Bars
  dayProgress = 0;
  yearProgress = 0;

  // Currently Status
  currentStatus = {
    location: 'Madison, WI',
    workingOn: 'CSI Loss Modeling Research',
    coffeeCount: 3,
    listening: 'Lo-fi Beats'
  };

  // Quotes
  quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Power electronics is the technology of efficiently converting electrical energy.", author: "Ned Mohan" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Engineering is not only study of 45 subjects but it is moral studies of intellectual life.", author: "Prakhar Srivastav" },
    { text: "Scientists study the world as it is, engineers create the world that never has been.", author: "Theodore von Kármán" }
  ];
  currentQuoteIndex = 0;
  currentQuote = this.quotes[0];
  private quoteInterval: any = null;

  // Fidget Spinner
  spinnerRotation = 0;
  isSpinning = false;
  private spinInterval: any = null;

  // Toggle Switches
  toggleStates = {
    toggle1: false,
    toggle2: true,
    toggle3: false
  };

  // Draggable Slider
  sliderValue = 50;

  // GitHub Contribution Graph (Demo Data)
  githubContributions: number[][] = [];

  // Theme Colors
  themeColors = [
    { name: 'Cyan', value: '#00d4ff' },
    { name: 'Green', value: '#00ff88' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#ff8c00' },
    { name: 'Pink', value: '#ff6b9d' },
    { name: 'Yellow', value: '#ffd700' }
  ];
  selectedThemeColor = '#00d4ff';

  // Clock Methods
  updateClocks(): void {
    const now = new Date();

    // USA (Central Time - Madison, WI)
    this.usaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    // India (IST)
    this.indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  }

  getClockHourRotation(date: Date): number {
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    return (hours * 30) + (minutes * 0.5); // 30 degrees per hour + 0.5 per minute
  }

  getClockMinuteRotation(date: Date): number {
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return (minutes * 6) + (seconds * 0.1); // 6 degrees per minute
  }

  getClockSecondRotation(date: Date): number {
    return date.getSeconds() * 6; // 6 degrees per second
  }

  isDayTime(date: Date): boolean {
    const hours = date.getHours();
    return hours >= 6 && hours < 18;
  }

  // Progress Methods
  updateProgress(): void {
    const now = new Date();

    // Day progress (percentage of day completed)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    this.dayProgress = ((now.getTime() - startOfDay.getTime()) / (endOfDay.getTime() - startOfDay.getTime())) * 100;

    // Year progress
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    this.yearProgress = ((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100;
  }

  // Quote Methods
  nextQuote(): void {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
    this.currentQuote = this.quotes[this.currentQuoteIndex];
  }

  prevQuote(): void {
    this.currentQuoteIndex = (this.currentQuoteIndex - 1 + this.quotes.length) % this.quotes.length;
    this.currentQuote = this.quotes[this.currentQuoteIndex];
  }

  // Fidget Spinner Methods
  spinFidget(): void {
    if (this.isSpinning) return;

    this.isSpinning = true;
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 seconds
    const totalRotation = 1800 + Math.random() * 1800; // 5-10 full rotations
    const startRotation = this.spinnerRotation;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.spinnerRotation = startRotation + (totalRotation * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
      }
    };

    requestAnimationFrame(animate);
  }

  // Toggle Methods
  toggleSwitch(key: 'toggle1' | 'toggle2' | 'toggle3'): void {
    this.toggleStates[key] = !this.toggleStates[key];
  }

  // GitHub Contributions (Generate Demo Data)
  generateGithubContributions(): void {
    this.githubContributions = [];
    for (let week = 0; week < 12; week++) {
      const weekData: number[] = [];
      for (let day = 0; day < 7; day++) {
        // Random contribution level (0-4)
        weekData.push(Math.floor(Math.random() * 5));
      }
      this.githubContributions.push(weekData);
    }
  }

  getContributionColor(level: number): string {
    const colors = ['#1a1a2e', '#0e4429', '#006d32', '#26a641', '#39d353'];
    return colors[level] || colors[0];
  }

  // Theme Color Methods
  setThemeColor(color: string): void {
    this.selectedThemeColor = color;
    document.documentElement.style.setProperty('--accent-color', color);
    // Convert hex to RGB for use in rgba()
    const rgb = this.hexToRgb(color);
    if (rgb) {
      document.documentElement.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Weather Icon
  getWeatherIcon(): string {
    const icons: { [key: string]: string } = {
      'sunny': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'stormy': '⛈️'
    };
    return icons[this.weather.icon] || '🌤️';
  }

  // Initialize Cover Page Widgets
  initCoverPageWidgets(): void {
    // Start clock updates
    this.updateClocks();
    this.clockInterval = setInterval(() => {
      this.updateClocks();
      this.updateProgress();
    }, 1000);

    // Update progress bars
    this.updateProgress();

    // Generate GitHub contributions
    this.generateGithubContributions();

    // Start quote rotation
    this.quoteInterval = setInterval(() => {
      this.nextQuote();
    }, 8000);
  }

  // Cleanup Cover Page Widgets
  cleanupCoverPageWidgets(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }
  }

  // ==================== END COVER PAGE WIDGETS ====================

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

    // First, decode HTML entities
    latex = latex.replace(/&nbsp;/g, ' ');
    latex = latex.replace(/&amp;/g, '&');
    latex = latex.replace(/&lt;/g, '<');
    latex = latex.replace(/&gt;/g, '>');
    latex = latex.replace(/&quot;/g, '"');
    latex = latex.replace(/&#39;/g, "'");

    // Extract text content and escape special LaTeX characters FIRST
    // We need to do this carefully to not break HTML tags
    const escapeLatexChars = (text: string): string => {
      return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/~/g, '\\textasciitilde{}');
    };

    // Process text between tags - escape special chars in content only
    latex = latex.replace(/>([^<]+)</g, (match, content) => {
      return '>' + escapeLatexChars(content) + '<';
    });

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

    // Convert links - need to unescape the URL
    latex = latex.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (match, url, text) => {
      // Unescape URL (it may have been escaped)
      const cleanUrl = url.replace(/\\([&%$#_{}])/g, '$1');
      return `\\href{${cleanUrl}}{${text}}`;
    });

    // Remove remaining HTML tags
    latex = latex.replace(/<[^>]+>/g, '');

    // Clean up extra whitespace
    latex = latex.replace(/\n{3,}/g, '\n\n');
    latex = latex.trim();

    // Escape title for LaTeX
    const safeTitle = this.currentFileName
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/([&%$#_{}])/g, '\\$1')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}');

    // Document structure
    const preamble = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{textcomp}

\\title{${safeTitle}}
\\date{}

\\begin{document}

\\maketitle

`;

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

  // Design Tools dropdown
  selectedDesignTool: string = 'bom-tool';
  designTools = [
    { id: 'bom-tool', name: 'BOM to DigiKey', icon: 'cart' },
    { id: 'latex-tool', name: 'Word & LaTeX Converter', icon: 'document' },
    { id: 'inverter-demo', name: 'VSI vs CSI Demo', icon: 'inverter' },
    { id: 'magnetics-tool', name: 'Magnetics Design', icon: 'inductor' },
    { id: 'heatsink-tool', name: 'Heatsink Calculator', icon: 'thermal' },
    { id: 'snubber-tool', name: 'Snubber Design', icon: 'circuit' }
  ];

  selectDesignTool(toolId: string): void {
    this.selectedDesignTool = toolId;
  }

  // Magnetics Design Tool properties
  magneticsInputs = {
    power: 100,           // Power in Watts
    inputVoltage: 48,     // Input voltage
    outputVoltage: 12,    // Output voltage
    frequency: 100,       // Switching frequency in kHz
    rippleCurrent: 20,    // Ripple current percentage
    dutyCycle: 50,        // Duty cycle percentage
    topology: 'buck'      // Topology: buck, boost, buck-boost
  };

  magneticsResults: {
    inductance: number;
    peakCurrent: number;
    rmsCurrent: number;
    energyStored: number;
    coreSize: string;
    turns: number;
    wireGauge: string;
    airGap: number;
    coreLoss: number;
    copperLoss: number;
    totalLoss: number;
  } | null = null;

  calculateMagnetics(): void {
    const P = this.magneticsInputs.power;
    const Vin = this.magneticsInputs.inputVoltage;
    const Vout = this.magneticsInputs.outputVoltage;
    const fsw = this.magneticsInputs.frequency * 1000; // Convert to Hz
    const ripple = this.magneticsInputs.rippleCurrent / 100;
    const D = this.magneticsInputs.dutyCycle / 100;

    let L: number, Iout: number, Iin: number, Ipk: number, Irms: number, deltaI: number;

    // Calculate based on topology
    switch (this.magneticsInputs.topology) {
      case 'buck':
        Iout = P / Vout;
        deltaI = ripple * Iout;
        L = (Vin - Vout) * D / (fsw * deltaI);
        Ipk = Iout + deltaI / 2;
        Irms = Math.sqrt(Math.pow(Iout, 2) + Math.pow(deltaI, 2) / 12);
        break;
      case 'boost':
        Iin = P / Vin;
        deltaI = ripple * Iin;
        L = Vin * D / (fsw * deltaI);
        Ipk = Iin + deltaI / 2;
        Irms = Math.sqrt(Math.pow(Iin, 2) + Math.pow(deltaI, 2) / 12);
        break;
      case 'buck-boost':
      default:
        Iin = P / Vin;
        deltaI = ripple * Iin;
        L = Vin * D / (fsw * deltaI);
        Ipk = Iin / D + deltaI / 2;
        Irms = Math.sqrt(Math.pow(Iin / D, 2) + Math.pow(deltaI, 2) / 12);
        break;
    }

    // Energy stored
    const E = 0.5 * L * Math.pow(Ipk, 2);

    // Core selection based on energy storage (simplified)
    let coreSize: string, Al: number, Ae: number;
    if (E < 0.0001) {
      coreSize = 'E16 / EE16'; Al = 1200; Ae = 19e-6;
    } else if (E < 0.0005) {
      coreSize = 'E25 / EE25'; Al = 2000; Ae = 40e-6;
    } else if (E < 0.002) {
      coreSize = 'E32 / EE32'; Al = 2500; Ae = 83e-6;
    } else if (E < 0.005) {
      coreSize = 'E42 / EE42'; Al = 3500; Ae = 178e-6;
    } else {
      coreSize = 'E55 / EE55'; Al = 4500; Ae = 354e-6;
    }

    // Calculate turns: N = sqrt(L / Al) * 1e9 (Al in nH/turn²)
    const turns = Math.ceil(Math.sqrt(L / (Al * 1e-9)));

    // Wire gauge based on current (5 A/mm² rule)
    const wireArea = Irms / 5; // mm²
    let wireGauge: string;
    if (wireArea < 0.13) wireGauge = 'AWG 26 (0.13 mm²)';
    else if (wireArea < 0.20) wireGauge = 'AWG 24 (0.20 mm²)';
    else if (wireArea < 0.32) wireGauge = 'AWG 22 (0.32 mm²)';
    else if (wireArea < 0.52) wireGauge = 'AWG 20 (0.52 mm²)';
    else if (wireArea < 0.82) wireGauge = 'AWG 18 (0.82 mm²)';
    else if (wireArea < 1.31) wireGauge = 'AWG 16 (1.31 mm²)';
    else if (wireArea < 2.08) wireGauge = 'AWG 14 (2.08 mm²)';
    else wireGauge = 'AWG 12 (3.31 mm²)';

    // Air gap calculation (simplified): lg = μ0 * N² * Ae / L - lm/μr
    const mu0 = 4 * Math.PI * 1e-7;
    const airGap = (mu0 * Math.pow(turns, 2) * Ae / L) * 1000; // in mm

    // Loss estimation (simplified Steinmetz for ferrite)
    const Bpk = L * Ipk / (turns * Ae); // Peak flux density
    const coreLoss = 0.01 * Math.pow(fsw / 1000, 1.5) * Math.pow(Bpk * 1000, 2.5); // mW/cm³ approx

    // Copper loss (DCR estimation)
    const MLT = 0.04; // Mean length per turn (m) - estimate
    const wireResistivity = 1.72e-8; // Copper
    const DCR = wireResistivity * turns * MLT / (wireArea * 1e-6);
    const copperLoss = Math.pow(Irms, 2) * DCR;

    this.magneticsResults = {
      inductance: L * 1e6, // μH
      peakCurrent: Ipk,
      rmsCurrent: Irms,
      energyStored: E * 1e6, // μJ
      coreSize: coreSize,
      turns: turns,
      wireGauge: wireGauge,
      airGap: Math.max(0.1, airGap),
      coreLoss: coreLoss,
      copperLoss: copperLoss,
      totalLoss: coreLoss + copperLoss
    };
  }

  // Heatsink Calculator properties
  heatsinkInputs = {
    powerLoss: 10,          // Power dissipation in Watts
    ambientTemp: 25,        // Ambient temperature °C
    maxJunctionTemp: 125,   // Max junction temperature °C
    thermalResJC: 0.5,      // Junction-to-case thermal resistance °C/W
    thermalResCS: 0.1,      // Case-to-sink thermal resistance °C/W
    coolingMethod: 'natural' // natural, forced-low, forced-high
  };

  heatsinkResults: {
    requiredRthSA: number;
    maxTcase: number;
    maxTsink: number;
    temperatureMargin: number;
    suggestedHeatsinks: Array<{name: string; rth: number; size: string}>;
    airflowRequired: number;
  } | null = null;

  calculateHeatsink(): void {
    const P = this.heatsinkInputs.powerLoss;
    const Ta = this.heatsinkInputs.ambientTemp;
    const Tjmax = this.heatsinkInputs.maxJunctionTemp;
    const RthJC = this.heatsinkInputs.thermalResJC;
    const RthCS = this.heatsinkInputs.thermalResCS;

    // Calculate required heatsink thermal resistance
    // Tj = Ta + P * (RthJC + RthCS + RthSA)
    // RthSA = (Tjmax - Ta) / P - RthJC - RthCS
    const RthSA = (Tjmax - Ta) / P - RthJC - RthCS;

    // Calculate temperatures
    const Tsink = Ta + P * RthSA;
    const Tcase = Tsink + P * RthCS;
    const Tj = Tcase + P * RthJC;
    const tempMargin = Tjmax - Tj;

    // Suggest heatsinks based on required thermal resistance
    let suggestedHeatsinks: Array<{name: string; rth: number; size: string}> = [];

    if (this.heatsinkInputs.coolingMethod === 'natural') {
      if (RthSA > 10) {
        suggestedHeatsinks = [
          { name: 'Small TO-220 clip-on', rth: 12, size: '15x10x8 mm' },
          { name: 'Aavid 577002', rth: 11, size: '19x13x10 mm' }
        ];
      } else if (RthSA > 5) {
        suggestedHeatsinks = [
          { name: 'Fischer SK 129', rth: 6.5, size: '30x25x10 mm' },
          { name: 'Aavid 531002', rth: 5.8, size: '35x35x10 mm' }
        ];
      } else if (RthSA > 2) {
        suggestedHeatsinks = [
          { name: 'Fischer SK 481', rth: 2.8, size: '50x50x15 mm' },
          { name: 'Aavid 6398B', rth: 2.5, size: '63x63x20 mm' }
        ];
      } else if (RthSA > 1) {
        suggestedHeatsinks = [
          { name: 'Fischer SK 489', rth: 1.4, size: '75x75x25 mm' },
          { name: 'Wakefield 423K', rth: 1.2, size: '100x100x25 mm' }
        ];
      } else {
        suggestedHeatsinks = [
          { name: 'Large extruded profile', rth: 0.8, size: '150x100x40 mm' },
          { name: 'Consider forced cooling', rth: 0.5, size: 'With fan' }
        ];
      }
    } else {
      // Forced convection - thermal resistance reduces significantly
      const factor = this.heatsinkInputs.coolingMethod === 'forced-high' ? 0.3 : 0.5;
      suggestedHeatsinks = [
        { name: 'Compact with fan', rth: RthSA * factor, size: '40x40x20 mm + 40mm fan' },
        { name: 'CPU-style cooler', rth: RthSA * factor * 0.8, size: '60x60x30 mm + fan' }
      ];
    }

    // Airflow required estimation (CFM) for forced cooling
    // Q = P / (ρ * Cp * ΔT) where ρ=1.2 kg/m³, Cp=1005 J/kg·K
    const deltaT = 10; // Assume 10°C air temperature rise
    const airflowM3s = P / (1.2 * 1005 * deltaT);
    const airflowCFM = airflowM3s * 2118.88; // Convert to CFM

    this.heatsinkResults = {
      requiredRthSA: Math.max(0, RthSA),
      maxTcase: Tcase,
      maxTsink: Tsink,
      temperatureMargin: tempMargin,
      suggestedHeatsinks: suggestedHeatsinks,
      airflowRequired: airflowCFM
    };
  }

  // Snubber Design Calculator properties
  snubberInputs = {
    voltage: 400,           // DC bus voltage
    current: 10,            // Load current
    deviceCoss: 100,        // Device output capacitance in pF
    strayInductance: 50,    // Stray inductance in nH
    switchingFreq: 50,      // Switching frequency in kHz
    snubberType: 'rc'       // rc, rcd, or clamp
  };

  snubberResults: {
    snubberC: number;
    snubberR: number;
    snubberD: string;
    clampVoltage: number;
    peakVoltageWithout: number;
    peakVoltageWith: number;
    snubberPowerLoss: number;
    dampingFactor: number;
    resonantFreq: number;
    recommendation: string;
  } | null = null;

  calculateSnubber(): void {
    const V = this.snubberInputs.voltage;
    const I = this.snubberInputs.current;
    const Coss = this.snubberInputs.deviceCoss * 1e-12; // Convert pF to F
    const Ls = this.snubberInputs.strayInductance * 1e-9; // Convert nH to H
    const fsw = this.snubberInputs.switchingFreq * 1000; // Convert to Hz

    // Resonant frequency of parasitic LC
    const f0 = 1 / (2 * Math.PI * Math.sqrt(Ls * Coss));

    // Peak voltage without snubber (LC ringing)
    // Vpk = V + I * sqrt(Ls/Coss)
    const Z0 = Math.sqrt(Ls / Coss);
    const Vpk_without = V + I * Z0;

    let Cs: number, Rs: number, Vpk_with: number, Ploss: number, zeta: number;
    let clampVoltage = 0;
    let diode = 'N/A';
    let recommendation = '';

    switch (this.snubberInputs.snubberType) {
      case 'rc':
        // RC Snubber design
        // C_snubber typically 2-5x Coss
        Cs = Coss * 3; // 3x Coss

        // R for critical damping: R = sqrt(L/C) / 2
        // But for overdamping to reduce ringing: R ≈ sqrt(L/C)
        Rs = Z0;

        // Damping factor
        zeta = Rs / (2 * Math.sqrt(Ls / Cs));

        // Peak voltage with snubber (reduced)
        Vpk_with = V + I * Z0 * Math.exp(-zeta * Math.PI);

        // Power loss in snubber: P = 0.5 * Cs * V² * fsw
        Ploss = 0.5 * Cs * Math.pow(V, 2) * fsw;

        recommendation = `RC snubber effective for moderate ringing. Resistor must handle ${(Ploss).toFixed(2)}W.`;
        break;

      case 'rcd':
        // RCD Snubber design
        // Capacitor sized to absorb turn-off energy
        Cs = Coss * 5;

        // R sets discharge time constant (should be < 1/fsw)
        Rs = 1 / (10 * Cs * fsw);

        zeta = 1; // RCD provides clamping, not damping

        // Clamp voltage above DC bus
        clampVoltage = V * 1.3; // Typical 30% overshoot allowance
        Vpk_with = clampVoltage;

        // Power loss
        Ploss = 0.5 * Cs * Math.pow(clampVoltage - V, 2) * fsw + 0.5 * Ls * Math.pow(I, 2) * fsw;

        diode = `Fast recovery, V_RRM > ${Math.ceil(clampVoltage * 1.5)}V, I_F > ${Math.ceil(I * 2)}A`;

        recommendation = `RCD snubber provides voltage clamping. Use ultra-fast diode (trr < 50ns).`;
        break;

      case 'clamp':
      default:
        // Active clamp / TVS approach
        clampVoltage = V * 1.2; // 20% above bus

        Cs = 0; // No explicit capacitor needed
        Rs = 0;

        zeta = 1; // Hard clamp
        Vpk_with = clampVoltage;

        // TVS/Zener absorbs the energy
        Ploss = 0.5 * Ls * Math.pow(I, 2) * fsw;

        diode = `TVS: V_BR = ${Math.ceil(clampVoltage)}V, P_peak > ${Math.ceil(0.5 * Ls * I * I * 1e6)}mJ`;

        recommendation = `TVS clamp is most effective for hard clamping. Ensure TVS can handle peak energy.`;
        break;
    }

    this.snubberResults = {
      snubberC: Cs * 1e9, // Convert to nF
      snubberR: Rs,
      snubberD: diode,
      clampVoltage: clampVoltage,
      peakVoltageWithout: Vpk_without,
      peakVoltageWith: Vpk_with,
      snubberPowerLoss: Ploss,
      dampingFactor: zeta,
      resonantFreq: f0 / 1e6, // MHz
      recommendation: recommendation
    };
  }

  // Inverter Demo properties
  inverterType: 'VSI' | 'CSI' = 'VSI';
  switchingFrequency = 10;
  switchState = [true, false, false, true]; // SW1, SW2, SW3, SW4
  energyFlowX = 20;
  idealWaveformPath = '';
  actualWaveformPath = '';
  rippleHeight = 30;
  ripplePercentage = 10;
  private animationFrameId: number | null = null;
  private switchInterval: any = null;

  // Loss Modeling Parameters (from IEEE paper: Su & Ning, ITEC 2013)
  // Operating conditions
  lossModelInputs = {
    dcBusVoltage: 450,      // V_dc in Volts
    batteryVoltage: 200,    // V_B in Volts
    peakCurrent: 220,       // I_peak in Amps (motor phase current)
    dcLinkCurrent: 150,     // I_dc for CSI in Amps
    modulationIndex: 0.9,   // m (0-1)
    powerFactor: 0.85,      // cos(θ)
    linePeakVoltage: 320,   // V_line_peak for CSI
  };

  // Device parameters from Table I of the paper
  // VSI IGBT parameters (Reference: 400V/400A)
  vsiIgbtParams = {
    Vce0: 0.782,      // V - saturation voltage at zero current
    rigbt: 2.624e-3,  // Ω - IGBT resistance
    Eon: 49.1e-3,     // J - turn-on energy
    Eoff: 88.5e-3,    // J - turn-off energy
    Vref: 400,        // V - reference voltage
    Iref: 400         // A - reference current
  };

  // VSI Diode parameters (Reference: 400V/400A)
  vsiDiodeParams = {
    Vf0: 1.098,       // V - forward voltage at zero current
    rdiode: 1.215e-3, // Ω - diode resistance
    Eoff: 9.5e-3,     // J - reverse recovery energy
    Vref: 400,
    Iref: 400
  };

  // CSI RB-IGBT parameters (Reference: 400V/200A)
  csiRbIgbtParams = {
    Vce0: 1.134,      // V
    rigbt: 3.64e-3,   // Ω
    Eon: 9.99e-3,     // J
    Eoff: 16.56e-3,   // J
    Err: 11.37e-3,    // J - reverse recovery loss
    Vref: 400,
    Iref: 200
  };

  // V-I Converter IGBT for CSI (Reference: 200V/300A)
  csiConverterIgbtParams = {
    Vce0: 0.626,      // V
    rigbt: 2.099e-3,  // Ω
    Eon: 12.74e-3,    // J
    Eoff: 28.34e-3,   // J
    Vref: 200,
    Iref: 300
  };

  // V-I Converter Diode for CSI (Reference: 200V/300A)
  csiConverterDiodeParams = {
    Vf0: 0.879,       // V
    rdiode: 0.972e-3, // Ω
    Eoff: 2.87e-3,    // J
    Vref: 200,
    Iref: 300
  };

  get recommendedSwitch(): { type: string; description: string; color: string } {
    if (this.switchingFrequency <= 2) {
      return {
        type: 'IGBT + Diode',
        description: 'Best for low frequency (1-2 kHz). High current capability, lower switching losses at low frequencies.',
        color: '#ff6b6b'
      };
    } else if (this.switchingFrequency <= 80) {
      return {
        type: 'SiC MOSFET',
        description: 'Optimal for medium-high frequency (2-80 kHz). Lower switching losses, higher efficiency than IGBT.',
        color: '#00d4ff'
      };
    } else {
      return {
        type: 'GaN MOSFET',
        description: 'Best for high frequency (80-100 kHz). Fastest switching, lowest losses at high frequencies.',
        color: '#00ff88'
      };
    }
  }

  /**
   * Loss Breakdown Calculation based on IEEE Paper:
   * "Loss Modeling and Comparison of VSI and RB-IGBT based CSI in Traction Drive Applications"
   * by Gui-Jia Su and Puqi Ning, ITEC 2013
   */
  get lossBreakdown(): {
    switching: number;
    conduction: number;
    converter: number;
    total: number;
    switchingPercent: number;
    conductionPercent: number;
    converterPercent: number;
    converterLabel: string;
    converterDescription: string;
    // Detailed breakdown
    igbtConductionLoss: number;
    diodeConductionLoss: number;
    bridgeSwitchingLoss: number;
    converterSwitchingLoss: number;
    converterConductionLoss: number;
  } {
    const fsw = this.switchingFrequency * 1000; // Convert kHz to Hz
    const Vdc = this.lossModelInputs.dcBusVoltage;
    const VB = this.lossModelInputs.batteryVoltage;
    const Ipeak = this.lossModelInputs.peakCurrent;
    const Idc = this.lossModelInputs.dcLinkCurrent;
    const m = this.lossModelInputs.modulationIndex;
    const cosTheta = this.lossModelInputs.powerFactor;
    const Vline_peak = this.lossModelInputs.linePeakVoltage;

    let bridgeSwitchingLoss: number;
    let igbtConductionLoss: number;
    let diodeConductionLoss: number;
    let converterSwitchingLoss: number;
    let converterConductionLoss: number;
    let converterLabel: string;
    let converterDescription: string;

    if (this.inverterType === 'VSI') {
      // ==================== VSI Loss Calculations ====================

      // --- VSI Bridge Switching Loss (Equation 3) ---
      // P_VSI_SL = (6 * fsw * Vdc * Ipeak) / (π * Vref * Iref) × (Eon + Eoff_igbt + Eoff_diode)
      const vsiSwitchingEnergy = this.vsiIgbtParams.Eon + this.vsiIgbtParams.Eoff + this.vsiDiodeParams.Eoff;
      bridgeSwitchingLoss = (6 * fsw * Vdc * Ipeak) /
        (Math.PI * this.vsiIgbtParams.Vref * this.vsiIgbtParams.Iref) * vsiSwitchingEnergy;

      // --- VSI IGBT Conduction Loss (Equation 4) ---
      // P_VSI_CL_igbt = Ipeak * Vce0 * (1/(2π) + m*cosθ/8) + Ipeak² * rigbt * (1/8 + m*cosθ/(3π))
      igbtConductionLoss = 6 * (
        Ipeak * this.vsiIgbtParams.Vce0 * (1/(2*Math.PI) + (m * cosTheta)/8) +
        Math.pow(Ipeak, 2) * this.vsiIgbtParams.rigbt * (1/8 + (m * cosTheta)/(3*Math.PI))
      );

      // --- VSI Diode Conduction Loss (Equation 5) ---
      // P_VSI_CL_diode = Ipeak * Vf0 * (1/(2π) - m*cosθ/8) + Ipeak² * rdiode * (1/8 - m*cosθ/(3π))
      diodeConductionLoss = 6 * (
        Ipeak * this.vsiDiodeParams.Vf0 * (1/(2*Math.PI) - (m * cosTheta)/8) +
        Math.pow(Ipeak, 2) * this.vsiDiodeParams.rdiode * (1/8 - (m * cosTheta)/(3*Math.PI))
      );

      // --- Boost/Buck Converter (BBC) Loss ---
      // Battery current (assuming power balance)
      const IB = (Vdc * Ipeak * m * cosTheta * Math.sqrt(3)/2) / VB; // Approximate DC battery current

      // BBC duty ratio for boost mode in motoring: d_BBC = 1 - VB/Vdc
      const dBBC = 1 - VB/Vdc;

      // BBC Switching Loss (Equation 7)
      // P_BBC_SL = (fsw * Vdc * IB) / (Vref * Iref) × (Eon + Eoff_igbt + Eoff_diode)
      converterSwitchingLoss = (fsw * Vdc * IB) /
        (this.vsiIgbtParams.Vref * this.vsiIgbtParams.Iref) * vsiSwitchingEnergy;

      // BBC Conduction Loss (Equation 8)
      // P_BBC_CL = IB * [dBBC * Vce0 + (1-dBBC) * Vf0] + [dBBC * rigbt + (1-dBBC) * rdiode] * IB²
      converterConductionLoss = IB * (dBBC * this.vsiIgbtParams.Vce0 + (1-dBBC) * this.vsiDiodeParams.Vf0) +
        (dBBC * this.vsiIgbtParams.rigbt + (1-dBBC) * this.vsiDiodeParams.rdiode) * Math.pow(IB, 2);

      converterLabel = 'Boost/Buck Converter Loss';
      converterDescription = 'BBC raises DC bus voltage from battery. Losses include IGBT/diode switching and conduction in the DC-DC stage.';

    } else {
      // ==================== CSI Loss Calculations ====================

      // --- CSI Bridge Conduction Loss (Equation 10) ---
      // P_CSI_CL = 2 * Idc * (Vce0 + Idc * rigbt)
      // Note: CSI has only 2 RB-IGBTs conducting at any time
      const totalCsiConductionLoss = 2 * Idc * (this.csiRbIgbtParams.Vce0 + Idc * this.csiRbIgbtParams.rigbt);
      igbtConductionLoss = totalCsiConductionLoss;
      diodeConductionLoss = 0; // CSI RB-IGBTs don't need antiparallel diodes

      // --- CSI Bridge Switching Loss (Equation 11) ---
      // P_CSI_SL = (3 * fsw * Vline_peak * Idc) / (π * Vref * Iref) × (Eon + Eoff + Err)
      const csiSwitchingEnergy = this.csiRbIgbtParams.Eon + this.csiRbIgbtParams.Eoff + this.csiRbIgbtParams.Err;
      bridgeSwitchingLoss = (3 * fsw * Vline_peak * Idc) /
        (Math.PI * this.csiRbIgbtParams.Vref * this.csiRbIgbtParams.Iref) * csiSwitchingEnergy;

      // --- V-I Converter Loss ---
      // V-I converter duty ratio for buck mode: d_VIC = Vdc / VB (where Vdc < VB for buck)
      // For boost mode (high speed): switches stay ON, no switching loss
      const isBoostMode = Vdc > VB;
      const dVIC = isBoostMode ? 1 : Vdc / VB;

      if (isBoostMode) {
        // Boost mode: no switching loss in V-I converter (Equation 14)
        converterSwitchingLoss = 0;
        // P_VIC_CL(boost) = 2 * Idc * (Vce0 + rigbt * Idc)
        converterConductionLoss = 2 * Idc * (this.csiConverterIgbtParams.Vce0 + this.csiConverterIgbtParams.rigbt * Idc);
      } else {
        // Buck mode: V-I converter switching loss (Equation 12)
        const vicSwitchingEnergy = this.csiConverterIgbtParams.Eon + this.csiConverterIgbtParams.Eoff + this.csiConverterDiodeParams.Eoff;
        converterSwitchingLoss = (fsw * VB * Idc) /
          (this.csiConverterIgbtParams.Vref * this.csiConverterIgbtParams.Iref) * vicSwitchingEnergy;

        // Buck mode conduction loss (Equation 13)
        // P_VIC_CL(buck) = Idc * [(1+dVIC)*Vce0 + (1-dVIC)*Vf0] + [(1+dVIC)*rigbt + (1-dVIC)*rdiode] * Idc²
        converterConductionLoss = Idc * ((1+dVIC) * this.csiConverterIgbtParams.Vce0 + (1-dVIC) * this.csiConverterDiodeParams.Vf0) +
          ((1+dVIC) * this.csiConverterIgbtParams.rigbt + (1-dVIC) * this.csiConverterDiodeParams.rdiode) * Math.pow(Idc, 2);
      }

      converterLabel = 'V-I Converter Loss';
      converterDescription = isBoostMode
        ? 'V-I converter in boost mode (high speed): switches stay ON, eliminating switching losses. Only conduction loss present.'
        : 'V-I converter in buck mode: converts voltage source to current source. Includes switching and conduction losses.';
    }

    // Calculate totals
    const totalConduction = igbtConductionLoss + diodeConductionLoss;
    const totalSwitching = bridgeSwitchingLoss;
    const totalConverter = converterSwitchingLoss + converterConductionLoss;
    const total = totalConduction + totalSwitching + totalConverter;

    return {
      switching: totalSwitching,
      conduction: totalConduction,
      converter: totalConverter,
      total: total,
      switchingPercent: (totalSwitching / total) * 100,
      conductionPercent: (totalConduction / total) * 100,
      converterPercent: (totalConverter / total) * 100,
      converterLabel: converterLabel,
      converterDescription: converterDescription,
      // Detailed breakdown
      igbtConductionLoss: igbtConductionLoss,
      diodeConductionLoss: diodeConductionLoss,
      bridgeSwitchingLoss: bridgeSwitchingLoss,
      converterSwitchingLoss: converterSwitchingLoss,
      converterConductionLoss: converterConductionLoss
    };
  }

  get lossExplanation(): string {
    const freq = this.switchingFrequency;
    const loss = this.lossBreakdown;

    if (this.inverterType === 'VSI') {
      const dominantLoss = loss.switchingPercent > loss.conductionPercent ? 'switching' : 'conduction';
      if (freq <= 10) {
        return `VSI at ${freq} kHz: Conduction losses dominate (${loss.conductionPercent.toFixed(1)}%). IGBT V_CE0 and r_on determine conduction loss per Eq. 4-5. Boost converter adds ${loss.converterPercent.toFixed(1)}% from DC-DC conversion.`;
      } else if (freq <= 50) {
        return `VSI at ${freq} kHz: ${dominantLoss} losses are ${dominantLoss === 'switching' ? 'now dominant' : 'still significant'}. Switching loss scales linearly with f_sw per Eq. 3: P_sw ∝ 6·f_sw·V_dc·I_peak·(E_on+E_off).`;
      } else {
        return `VSI at ${freq} kHz: Switching losses dominate (${loss.switchingPercent.toFixed(1)}%). High frequency requires SiC/GaN devices to reduce E_on and E_off. BBC converter switching loss also scales with frequency.`;
      }
    } else {
      const isBoostMode = this.lossModelInputs.dcBusVoltage > this.lossModelInputs.batteryVoltage;
      if (freq <= 10) {
        return `CSI at ${freq} kHz: RB-IGBT conduction loss dominates (Eq. 10: P_cond = 2·I_dc·(V_CE0 + I_dc·r_igbt)). ${isBoostMode ? 'V-I converter in boost mode eliminates its switching losses.' : 'V-I converter in buck mode adds switching losses.'}`;
      } else if (freq <= 50) {
        return `CSI at ${freq} kHz: Bridge switching loss (Eq. 11) uses E_on + E_off + E_rr of RB-IGBTs. CSI requires reverse-blocking capability, adding E_rr term. ${isBoostMode ? 'High-speed boost mode keeps V-I converter efficient.' : ''}`;
      } else {
        return `CSI at ${freq} kHz: At high frequency, CSI switching loss (${loss.switchingPercent.toFixed(1)}%) increases but RB-IGBTs have lower switching energies than VSI IGBTs. ${isBoostMode ? 'V-I converter boost mode provides 18.8% energy savings per paper results.' : ''}`;
      }
    }
  }

  // Creative Loss Breakdown Helper Methods (IEEE Paper-based)

  // Input power calculation (approximate based on motor operating point)
  getInputPower(): number {
    // P_in = V_dc * I_dc * sqrt(3)/2 * m * cos(θ) for 3-phase inverter
    // Simplified: using rated power assumption
    const m = this.lossModelInputs.modulationIndex;
    const cosTheta = this.lossModelInputs.powerFactor;
    const Vdc = this.lossModelInputs.dcBusVoltage;
    const Ipeak = this.lossModelInputs.peakCurrent;
    // 3-phase apparent power: S = 3/2 * Vpeak * Ipeak = 3/2 * (Vdc*m/sqrt(2)) * Ipeak
    // Real power: P = S * cos(θ)
    return (3/2) * (Vdc * m / Math.sqrt(2)) * (Ipeak / Math.sqrt(2)) * cosTheta;
  }

  getEfficiency(): number {
    const inputPower = this.getInputPower();
    const totalLoss = this.lossBreakdown.total;
    const efficiency = ((inputPower - totalLoss) / inputPower) * 100;
    return Math.max(50, Math.min(99.9, efficiency));
  }

  getEfficiencyColor(): string {
    const eff = this.getEfficiency();
    if (eff >= 95) return '#00ff88';
    if (eff >= 90) return '#ffaa00';
    return '#ff6b6b';
  }

  getGaugeRotation(): number {
    // Map efficiency (50-100%) to rotation (-90 to 90 degrees)
    const eff = this.getEfficiency();
    const normalized = (eff - 50) / 50; // 0 to 1
    return -90 + (normalized * 180);
  }

  getGaugeEndpoint(): { x: number; y: number } {
    const eff = this.getEfficiency();
    const normalized = (eff - 50) / 50;
    const angle = Math.PI - (normalized * Math.PI); // PI to 0
    const radius = 80;
    const centerX = 100;
    const centerY = 110;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY - radius * Math.sin(angle)
    };
  }

  getTotalLossWatts(): number {
    return Math.round(this.lossBreakdown.total);
  }

  getOutputPower(): number {
    return Math.round(this.getInputPower() - this.lossBreakdown.total);
  }

  getSwitchingLossWatts(): number {
    return Math.round(this.lossBreakdown.switching);
  }

  getConductionLossWatts(): number {
    return Math.round(this.lossBreakdown.conduction);
  }

  getConverterLossWatts(): number {
    return Math.round(this.lossBreakdown.converter);
  }

  // Detailed loss getters for visualization
  getIgbtConductionLoss(): number {
    return Math.round(this.lossBreakdown.igbtConductionLoss);
  }

  getDiodeConductionLoss(): number {
    return Math.round(this.lossBreakdown.diodeConductionLoss);
  }

  getBridgeSwitchingLoss(): number {
    return Math.round(this.lossBreakdown.bridgeSwitchingLoss);
  }

  getConverterSwitchingLoss(): number {
    return Math.round(this.lossBreakdown.converterSwitchingLoss);
  }

  getConverterConductionLoss(): number {
    return Math.round(this.lossBreakdown.converterConductionLoss);
  }

  getDonutDash(percent: number): string {
    const circumference = 2 * Math.PI * 70; // radius = 70
    const dashLength = (percent / 100) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getDonutOffset(previousPercent: number): number {
    const circumference = 2 * Math.PI * 70;
    return (previousPercent / 100) * circumference;
  }

  getTempColor(lossWatts: number): string {
    // Temperature color based on absolute loss in Watts
    if (lossWatts >= 500) return '#ff4444';
    if (lossWatts >= 200) return '#ffaa00';
    if (lossWatts >= 100) return '#ffcc00';
    return '#00ff88';
  }

  getComponentTemp(lossWatts: number, thermalResistance: number = 0.5): number {
    // Temperature rise: ΔT = P × Rth, assuming 25°C ambient
    // Using simplified thermal model
    return Math.round(25 + (lossWatts * thermalResistance));
  }

  highlightedLoss: string | null = null;

  highlightLoss(lossType: string | null): void {
    this.highlightedLoss = lossType;
  }

  // Loss comparison between VSI and CSI
  getLossComparison(): { vsiLoss: number; csiLoss: number; savings: number; savingsPercent: number } {
    // Store current type
    const originalType = this.inverterType;

    // Calculate VSI loss
    this.inverterType = 'VSI';
    const vsiLoss = this.lossBreakdown.total;

    // Calculate CSI loss
    this.inverterType = 'CSI';
    const csiLoss = this.lossBreakdown.total;

    // Restore original type
    this.inverterType = originalType;

    const savings = vsiLoss - csiLoss;
    const savingsPercent = (savings / vsiLoss) * 100;

    return {
      vsiLoss: Math.round(vsiLoss),
      csiLoss: Math.round(csiLoss),
      savings: Math.round(savings),
      savingsPercent: savingsPercent
    };
  }

  ngOnInit(): void {
    this.initCoverPageWidgets();
    this.updateWaveform();
    this.startSwitchAnimation();
    this.startEnergyFlowAnimation();
  }

  ngOnDestroy(): void {
    this.cleanupCoverPageWidgets();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.switchInterval) {
      clearInterval(this.switchInterval);
    }
  }

  toggleInverterType(): void {
    this.inverterType = this.inverterType === 'VSI' ? 'CSI' : 'VSI';
    this.updateWaveform();
  }

  updateWaveform(): void {
    // Calculate ripple based on switching frequency (inversely proportional)
    const baseRipple = 50; // Ripple at 1 kHz
    this.ripplePercentage = Math.round(baseRipple / this.switchingFrequency);
    this.rippleHeight = Math.max(5, 50 / this.switchingFrequency);

    // Generate ideal sinusoidal waveform
    const points = 340;
    const startX = 40;
    const centerY = 75;
    const amplitude = 40;

    let idealPath = `M ${startX} ${centerY}`;
    let actualPath = `M ${startX} ${centerY}`;

    for (let i = 0; i <= points; i++) {
      const x = startX + i;
      const t = (i / points) * 4 * Math.PI; // Two complete cycles

      // Ideal sine wave
      const idealY = centerY - amplitude * Math.sin(t);
      idealPath += ` L ${x} ${idealY}`;

      // Actual waveform with ripple
      const rippleMagnitude = (baseRipple / this.switchingFrequency) * 0.4;
      const rippleFreq = this.switchingFrequency * 2;
      const ripple = rippleMagnitude * Math.sin(t * rippleFreq);
      const actualY = centerY - amplitude * Math.sin(t) + ripple;
      actualPath += ` L ${x} ${actualY}`;
    }

    this.idealWaveformPath = idealPath;
    this.actualWaveformPath = actualPath;
  }

  startSwitchAnimation(): void {
    // Animate switches at a visible rate (not actual switching frequency)
    this.switchInterval = setInterval(() => {
      // Toggle between two states: (SW1, SW4 on) and (SW2, SW3 on)
      if (this.switchState[0]) {
        this.switchState = [false, true, true, false];
      } else {
        this.switchState = [true, false, false, true];
      }
    }, Math.max(100, 1000 / this.switchingFrequency));
  }

  startEnergyFlowAnimation(): void {
    const animate = () => {
      this.energyFlowX += 2;
      if (this.energyFlowX > 380) {
        this.energyFlowX = 20;
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }
}
