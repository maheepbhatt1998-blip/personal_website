import { Component, OnInit, OnDestroy, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Loaded at runtime from CDN (see src/index.html)
declare const MathJax: any;
declare const MathfieldElement: any;

interface BomResult {
  partNumber: string;
  digikeyUrl: string;
  baseQuantity: number;   // raw qty from BOM
  quantity: number;       // adjusted = ceil(base * boards * (1 + spare/100))
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]   // allow the <math-field> custom element (MathLive)
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  // Expose Math to template
  Math = Math;

  constructor(private sanitizer: DomSanitizer) {}

  // ==================== PAGE NAVIGATION ====================
  currentPage: 'home' | 'about' | 'research' | 'design-tools' | 'blog' = 'home';

  navigateTo(page: 'home' | 'about' | 'research' | 'design-tools' | 'blog'): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.setupRevealAnimations();
      if (page === 'home') this.setupHeroInteractions();
    }, 50);
  }

  // ==================== SCROLL-REVEAL ANIMATIONS ====================
  private revealObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    this.setupRevealAnimations();
    if (this.currentPage === 'home') this.setupHeroInteractions();
    this.configureMathLive();
  }

  // Point the CDN-loaded MathLive at its font assets and silence its sounds.
  private configureMathLive(): void {
    if (typeof MathfieldElement === 'undefined') return;   // CDN may not have loaded yet
    MathfieldElement.fontsDirectory = 'https://cdn.jsdelivr.net/npm/mathlive/dist/fonts';
    MathfieldElement.soundsDirectory = null;
  }

  // ==================== HERO INTERACTIONS (parallax + magnetic cards) ====================
  private setupHeroInteractions(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cover = document.querySelector<HTMLElement>('.cover-page');
    if (cover && !cover.dataset['parallaxBound']) {
      cover.dataset['parallaxBound'] = '1';
      cover.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = cover.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 60;
        cover.style.setProperty('--mx', `${x}px`);
        cover.style.setProperty('--my', `${y}px`);
      });
      cover.addEventListener('mouseleave', () => {
        cover.style.setProperty('--mx', '0px');
        cover.style.setProperty('--my', '0px');
      });
    }

    document.querySelectorAll<HTMLElement>('.nav-card').forEach(card => {
      if (card.dataset['magneticBound']) return;
      card.dataset['magneticBound'] = '1';

      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.setProperty('--tilt-x', `${ny * -5}deg`);
        card.style.setProperty('--tilt-y', `${nx * 5}deg`);
        card.style.setProperty('--mag-x', `${nx * 10}px`);
        card.style.setProperty('--mag-y', `${ny * 10}px`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--mag-x', '0px');
        card.style.setProperty('--mag-y', '0px');
      });
    });
  }

  private setupRevealAnimations(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.revealObserver!.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(
      '.section .section-content, .timeline-item'
    ).forEach(el => {
      el.classList.add('reveal');
      this.revealObserver!.observe(el);
    });

    document.querySelectorAll(
      '.education-grid, .skills-grid, .research-grid, .pcb-grid, .tools-grid, .publications-list'
    ).forEach(el => {
      el.classList.add('reveal-stagger');
      this.revealObserver!.observe(el);
    });
  }

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
    workingOn: 'CSI Loss Modeling Research'
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

    // Start quote rotation
    this.quoteInterval = setInterval(() => {
      this.nextQuote();
    }, 8000);

    // Fetch live weather + refresh every 10 minutes
    this.fetchWeather();
    this.weatherInterval = setInterval(() => this.fetchWeather(), 10 * 60 * 1000);
  }

  // Weather fetch — Open-Meteo (no API key required)
  private weatherInterval: any = null;

  async fetchWeather(): Promise<void> {
    try {
      const url =
        'https://api.open-meteo.com/v1/forecast' +
        '?latitude=43.0731&longitude=-89.4012' +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,weather_code' +
        '&daily=sunrise,sunset' +
        '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago';

      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const c = data.current;
      const d = data.daily;
      if (!c) return;

      const formatTime = (iso: string) => {
        if (!iso) return '';
        const dt = new Date(iso);
        return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
      };

      this.weather = {
        ...this.weather,
        tempF: Math.round(c.temperature_2m),
        feelsLikeF: Math.round(c.apparent_temperature),
        humidity: Math.round(c.relative_humidity_2m),
        windSpeed: Math.round(c.wind_speed_10m),
        windDirection: this.degToCompass(c.wind_direction_10m),
        pressure: Math.round(c.surface_pressure),
        cloudCover: Math.round(c.cloud_cover),
        condition: this.wmoCodeToCondition(c.weather_code),
        icon: this.wmoCodeToIcon(c.weather_code),
        sunrise: d?.sunrise?.[0] ? formatTime(d.sunrise[0]) : this.weather.sunrise,
        sunset: d?.sunset?.[0] ? formatTime(d.sunset[0]) : this.weather.sunset
      };
    } catch {
      // Silently keep prior data on failure
    }
  }

  private wmoCodeToCondition(code: number): string {
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
  }

  private wmoCodeToIcon(code: number): string {
    if (code === 0 || code === 1) return 'sunny';
    if (code === 2) return 'partly-cloudy';
    if (code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 86) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 95) return 'storm';
    return 'partly-cloudy';
  }

  private degToCompass(deg: number): string {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round((deg % 360) / 22.5) % 16];
  }

  // Cleanup Cover Page Widgets
  cleanupCoverPageWidgets(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }
    if (this.weatherInterval) {
      clearInterval(this.weatherInterval);
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

  // ==================== BLOG POSTS ====================
  blogPosts = [
    {
      title: 'Why Current-Source Inverters Matter for Next-Gen EV Drives',
      excerpt: 'Voltage-source inverters dominate today’s drives, but CSI architectures offer compelling advantages for SiC and GaN at high frequencies. Here’s why I think they deserve another look.',
      date: '2025-03-14',
      tags: ['CSI', 'EV', 'Power Electronics'],
      readTime: '7 min read',
      platform: 'Medium',
      url: 'https://medium.com/@maheepbhatt'
    },
    {
      title: 'Designing PCBs for High-Frequency SiC Inverters',
      excerpt: 'Lessons from spinning multiple boards at WEMPEC — from layout choices that kill ringing to gate-drive layout patterns that survive 100 kHz switching.',
      date: '2025-01-22',
      tags: ['PCB', 'SiC', 'Hardware'],
      readTime: '9 min read',
      platform: 'Substack',
      url: 'https://substack.com/'
    },
    {
      title: 'From Simulation to Hardware: A WEMPEC Story',
      excerpt: 'How I closed the loop from MATLAB/Simulink → PLECS → PSIM → a working bench prototype. What translated, what didn’t, and where I lost a week debugging.',
      date: '2024-11-09',
      tags: ['WEMPEC', 'Workflow', 'Simulation'],
      readTime: '6 min read',
      platform: 'Dev.to',
      url: 'https://dev.to/'
    },
    {
      title: 'What I Learned from My Ford Internship',
      excerpt: 'A summer inside an OEM powertrain team — the gap between academia and industry, the gap between a paper claim and a vehicle requirement, and what I’d do differently.',
      date: '2024-09-02',
      tags: ['Industry', 'EV', 'Career'],
      readTime: '5 min read',
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/maheep-bhatt'
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
  boardCount = 1;
  sparePercent = 0;

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
      baseQuantity: qty,
      quantity: this.getAdjustedQty(qty)
    }));
  }

  getAdjustedQty(baseQty: number): number {
    return Math.ceil(baseQty * this.boardCount * (1 + this.sparePercent / 100));
  }

  recalculateQuantities(): void {
    this.digiKeyCartUrl = '';
    this.bomResults = this.bomResults.map(r => ({
      ...r,
      quantity: this.getAdjustedQty(r.baseQuantity)
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

  createDigiKeyCart(): void {
    if (this.bomResults.length === 0 || !this.selectedQuantityColumn) {
      return;
    }

    // DigiKey FastAdd: POST to fastadd.aspx with part1/qty1, part2/qty2, ...
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.digikey.com/classic/ordering/fastadd.aspx';
    form.target = '_blank';
    form.style.display = 'none';

    // Start a new cart
    const newCartField = document.createElement('input');
    newCartField.type  = 'hidden';
    newCartField.name  = 'newcart';
    newCartField.value = 'true';
    form.appendChild(newCartField);

    // Add each part as numbered field pairs: part1/qty1, part2/qty2, ...
    this.bomResults.forEach((item, i) => {
      const n = i + 1;

      const partField = document.createElement('input');
      partField.type  = 'hidden';
      partField.name  = `part${n}`;
      partField.value = item.partNumber;
      form.appendChild(partField);

      const qtyField  = document.createElement('input');
      qtyField.type   = 'hidden';
      qtyField.name   = `qty${n}`;
      qtyField.value  = String(item.quantity);
      form.appendChild(qtyField);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    this.digiKeyCartUrl = 'https://www.digikey.com/ordering/shoppingcart';
    this.bomMessage = `${this.bomResults.length} components sent to DigiKey cart.`;
    this.bomMessageType = 'success';
  }

  exportBomCsv(): void {
    const csvLines = ['Quantity,Part Number'];
    this.bomResults.forEach(item => {
      csvLines.push(`${item.quantity},"${item.partNumber}"`);
    });
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'digikey_bom.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Design Tools dropdown
  selectedDesignTool: string = 'csi-tool';
  designTools = [
    { id: 'csi-tool', name: 'CSI Design Tool', icon: 'inverter' },
    { id: 'bom-tool', name: 'BOM to DigiKey', icon: 'cart' },
    { id: 'inverter-demo', name: 'VSI vs CSI Demo', icon: 'inverter' },
    { id: 'magnetics-tool', name: 'Magnetics Design', icon: 'inductor' },
    { id: 'heatsink-tool', name: 'Heatsink Calculator', icon: 'thermal' },
    { id: 'snubber-tool', name: 'Snubber Design', icon: 'circuit' },
    { id: 'eqn-studio', name: 'Equation Studio', icon: 'formula' }
  ];

  selectDesignTool(toolId: string): void {
    this.selectedDesignTool = toolId;
    if (toolId === 'eqn-studio') {
      // The <math-field> mounts on this tick; render once it exists.
      setTimeout(() => { this.configureMathLive(); this.renderEqnPreview(); }, 50);
    }
  }

  // ==================== EQUATION STUDIO TOOL ====================
  // Visual MathLive editor (no LaTeX needed) -> MathJax SVG/PNG export for Inkscape.
  @ViewChild('mathField') mathFieldRef?: ElementRef<any>;

  eqnColor = '#111111';
  eqnFont = 'normal';     // MathLive math variant: normal | sans-serif | monospace | script | double-struck | fraktur
  eqnSize = 4;            // MathLive fontSize 1..10 (per-selection emphasis)
  eqnOutputSize = 24;     // overall font size in POINTS (pt), Word-style (drives SVG/PNG output size)
  eqnPngScale = 1;        // extra PNG supersampling on top of the already-high render density
  eqnTransparentBg = true;
  eqnSvgMarkup = '';
  eqnSafePreview: SafeHtml = '';
  eqnPxW = 0;             // intrinsic px width/height of the last rendered SVG (for crisp PNG export)
  eqnPxH = 0;
  eqnMessage = '';
  eqnMessageType: 'error' | 'success' | '' = '';

  // Quick-insert palette, grouped by category. label = button glyph, latex = inserted snippet
  // (#0/#1/… become edit slots in the MathLive field).
  eqnPalette: { name: string; items: { label: string; latex: string }[] }[] = [
    {
      name: 'Structure',
      items: [
        { label: 'a⁄b', latex: '\\frac{#0}{#1}' },
        { label: '√', latex: '\\sqrt{#0}' },
        { label: 'ⁿ√', latex: '\\sqrt[#0]{#1}' },
        { label: 'xⁿ', latex: '#0^{#1}' },
        { label: 'xₙ', latex: '#0_{#1}' },
        { label: '( )', latex: '\\left( #0 \\right)' },
        { label: '|x|', latex: '\\left| #0 \\right|' },
        { label: '[ ]', latex: '\\begin{bmatrix} #0 & #1 \\\\ #2 & #3 \\end{bmatrix}' }
      ]
    },
    {
      name: 'Operators',
      items: [
        { label: '±', latex: '\\pm' },
        { label: '∓', latex: '\\mp' },
        { label: '×', latex: '\\times' },
        { label: '÷', latex: '\\div' },
        { label: '·', latex: '\\cdot' },
        { label: '∂', latex: '\\partial' },
        { label: '∇', latex: '\\nabla' },
        { label: '∫', latex: '\\int_{#0}^{#1}' },
        { label: '∮', latex: '\\oint' },
        { label: '∑', latex: '\\sum_{#0}^{#1}' },
        { label: '∏', latex: '\\prod_{#0}^{#1}' },
        { label: '∞', latex: '\\infty' }
      ]
    },
    {
      name: 'Relations',
      items: [
        { label: '≠', latex: '\\neq' },
        { label: '≈', latex: '\\approx' },
        { label: '≤', latex: '\\leq' },
        { label: '≥', latex: '\\geq' },
        { label: '≪', latex: '\\ll' },
        { label: '≫', latex: '\\gg' },
        { label: '∝', latex: '\\propto' },
        { label: '≡', latex: '\\equiv' },
        { label: '∼', latex: '\\sim' },
        { label: '∠', latex: '\\angle' },
        { label: '→', latex: '\\to' },
        { label: '⇒', latex: '\\Rightarrow' },
        { label: '↔', latex: '\\leftrightarrow' }
      ]
    },
    {
      name: 'Greek',
      items: [
        { label: 'α', latex: '\\alpha' }, { label: 'β', latex: '\\beta' },
        { label: 'γ', latex: '\\gamma' }, { label: 'δ', latex: '\\delta' },
        { label: 'ε', latex: '\\epsilon' }, { label: 'ζ', latex: '\\zeta' },
        { label: 'η', latex: '\\eta' }, { label: 'θ', latex: '\\theta' },
        { label: 'κ', latex: '\\kappa' }, { label: 'λ', latex: '\\lambda' },
        { label: 'μ', latex: '\\mu' }, { label: 'ν', latex: '\\nu' },
        { label: 'ξ', latex: '\\xi' }, { label: 'π', latex: '\\pi' },
        { label: 'ρ', latex: '\\rho' }, { label: 'σ', latex: '\\sigma' },
        { label: 'τ', latex: '\\tau' }, { label: 'φ', latex: '\\phi' },
        { label: 'χ', latex: '\\chi' }, { label: 'ψ', latex: '\\psi' },
        { label: 'ω', latex: '\\omega' },
        { label: 'Γ', latex: '\\Gamma' }, { label: 'Δ', latex: '\\Delta' },
        { label: 'Θ', latex: '\\Theta' }, { label: 'Λ', latex: '\\Lambda' },
        { label: 'Ξ', latex: '\\Xi' }, { label: 'Π', latex: '\\Pi' },
        { label: 'Σ', latex: '\\Sigma' }, { label: 'Φ', latex: '\\Phi' },
        { label: 'Ψ', latex: '\\Psi' }, { label: 'Ω', latex: '\\Omega' }
      ]
    },
    {
      name: 'Units',
      items: [
        { label: 'Ω', latex: '\\Omega' },
        { label: 'µ', latex: '\\mu' },
        { label: '°', latex: '^{\\circ}' },
        { label: '°C', latex: '\\,^{\\circ}\\mathrm{C}' },
        { label: '°F', latex: '\\,^{\\circ}\\mathrm{F}' },
        { label: '℧', latex: '\\mho' },
        { label: '·', latex: '\\cdot' },
        { label: 'mV', latex: '\\,\\mathrm{mV}' },
        { label: 'mA', latex: '\\,\\mathrm{mA}' },
        { label: 'kΩ', latex: '\\,\\mathrm{k\\Omega}' },
        { label: 'MΩ', latex: '\\,\\mathrm{M\\Omega}' },
        { label: 'µF', latex: '\\,\\mathrm{\\mu F}' },
        { label: 'nF', latex: '\\,\\mathrm{nF}' },
        { label: 'µH', latex: '\\,\\mathrm{\\mu H}' },
        { label: 'mH', latex: '\\,\\mathrm{mH}' },
        { label: 'kHz', latex: '\\,\\mathrm{kHz}' },
        { label: 'MHz', latex: '\\,\\mathrm{MHz}' },
        { label: 'kW', latex: '\\,\\mathrm{kW}' }
      ]
    },
    {
      name: 'Sets',
      items: [
        { label: '∈', latex: '\\in' },
        { label: '∉', latex: '\\notin' },
        { label: '⊂', latex: '\\subset' },
        { label: '⊆', latex: '\\subseteq' },
        { label: '⊃', latex: '\\supset' },
        { label: '∪', latex: '\\cup' },
        { label: '∩', latex: '\\cap' },
        { label: '∅', latex: '\\emptyset' },
        { label: '∀', latex: '\\forall' },
        { label: '∃', latex: '\\exists' },
        { label: 'ℝ', latex: '\\mathbb{R}' },
        { label: 'ℂ', latex: '\\mathbb{C}' },
        { label: 'ℤ', latex: '\\mathbb{Z}' },
        { label: 'ℕ', latex: '\\mathbb{N}' },
        { label: 'ℚ', latex: '\\mathbb{Q}' }
      ]
    },
    {
      name: 'Accents',
      items: [
        { label: 'ẋ', latex: '\\dot{#0}' },
        { label: 'ẍ', latex: '\\ddot{#0}' },
        { label: 'x̂', latex: '\\hat{#0}' },
        { label: 'x̄', latex: '\\bar{#0}' },
        { label: 'x⃗', latex: '\\vec{#0}' },
        { label: 'x̃', latex: '\\tilde{#0}' },
        { label: 'ẋ̇', latex: '\\dddot{#0}' },
        { label: 'x′', latex: '#0^{\\prime}' }
      ]
    }
  ];

  private get mathField(): any | null {
    return this.mathFieldRef?.nativeElement ?? null;
  }

  // --- Formatting toolbar (drives MathLive applyStyle / insertions) ---
  // Math mode uses variantStyle/variant (not fontSeries/fontShape, which are text-mode only).
  eqnBold(): void { this.mathField?.applyStyle({ variantStyle: 'bold' }); this.afterEqnEdit(); }
  eqnItalic(): void { this.mathField?.applyStyle({ variantStyle: 'italic' }); this.afterEqnEdit(); }
  eqnUnderline(): void { this.mathField?.executeCommand(['insert', '\\underline{#0}']); this.afterEqnEdit(); }
  eqnSetFont(v: string): void { this.eqnFont = v; this.mathField?.applyStyle({ variant: v }); this.afterEqnEdit(); }
  eqnSetSize(n: number): void { this.eqnSize = +n; this.mathField?.applyStyle({ fontSize: +n }); this.afterEqnEdit(); }
  eqnSetColor(hex: string): void { this.eqnColor = hex; this.mathField?.applyStyle({ color: hex }); this.afterEqnEdit(); }
  eqnInsert(latex: string): void { this.mathField?.executeCommand(['insert', latex]); this.afterEqnEdit(); }
  eqnClear(): void { if (this.mathField) { this.mathField.value = ''; } this.renderEqnPreview(); }

  private afterEqnEdit(): void {
    this.mathField?.focus?.();
    this.renderEqnPreview();
  }

  // Render the current equation to a vector SVG via MathJax (the export preview = exactly what gets copied).
  renderEqnPreview(): void {
    if (typeof MathJax === 'undefined' || !MathJax?.tex2svg) {
      this.setEqnMessage('Renderer still loading… try again in a moment.', 'error');
      return;
    }
    const raw = (this.mathField?.value ?? '').trim();
    if (!raw) {
      this.eqnSvgMarkup = '';
      this.eqnSafePreview = '';
      this.eqnMessage = '';
      this.eqnMessageType = '';
      return;
    }
    try {
      const latex = this.normalizeLatex(raw);
      const node = MathJax.tex2svg(latex, { display: true });
      const svg: SVGElement | null = node.querySelector('svg');
      if (!svg) { this.setEqnMessage('Could not render this equation.', 'error'); return; }
      if (svg.querySelector('[data-mjx-error], merror, .mjx-error')) {
        this.setEqnMessage('Check the equation — part of it is not valid.', 'error');
      } else if (this.eqnMessageType === 'error') {
        this.eqnMessage = '';
        this.eqnMessageType = '';
      }
      this.sizeSvg(svg);
      this.eqnSvgMarkup = svg.outerHTML;
      this.eqnSafePreview = this.sanitizer.bypassSecurityTrustHtml(this.eqnSvgMarkup);
    } catch {
      this.setEqnMessage('Could not render this equation.', 'error');
    }
  }

  // Chosen font size converted points -> pixels (1pt = 96/72 px at 96 dpi, like Word).
  private get eqnOutputPx(): number { return (this.eqnOutputSize || 24) * 4 / 3; }

  // Resize MathJax's SVG to the chosen point size AND bake that scale into the geometry, expressing
  // the viewBox in pixels. MathJax emits a fixed viewBox in its own internal units, which apps like
  // Inkscape read as the object's true size — so just changing width/height is ignored and the
  // equation always imports at the same big size. Rewriting the viewBox to pixels fixes that.
  private sizeSvg(svg: SVGElement): void {
    const k = this.eqnOutputPx * 0.5;   // px per ex (1ex ≈ 0.5 × font size)
    const wEx = parseFloat(svg.getAttribute('width') || '0');
    const hEx = parseFloat(svg.getAttribute('height') || '0');
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
    if (!(wEx > 0 && hEx > 0) || vb.length !== 4 || !(vb[2] > 0)) {
      this.eqnPxW = 0;
      this.eqnPxH = 0;
      return;
    }
    const pxW = Math.max(1, Math.round(wEx * k));
    const pxH = Math.max(1, Math.round(hEx * k));
    this.eqnPxW = pxW;
    this.eqnPxH = pxH;

    // Wrap MathJax's content in a group that maps its internal units onto the pixel viewBox.
    const [vx, vy, vw] = vb;
    const s = pxW / vw;
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${(-s * vx).toFixed(4)} ${(-s * vy).toFixed(4)}) scale(${s.toFixed(6)})`);
    while (svg.firstChild) { g.appendChild(svg.firstChild); }
    svg.appendChild(g);

    svg.setAttribute('viewBox', `0 0 ${pxW} ${pxH}`);
    svg.setAttribute('width', String(pxW));
    svg.setAttribute('height', String(pxH));
    svg.style.removeProperty('vertical-align');
    // MathJax glyphs use fill="currentColor"; pin it so the export is self-contained (and the preview
    // doesn't inherit the dark theme's light text color). Per-selection \textcolor still overrides this.
    svg.style.color = this.eqnColor;
  }

  eqnSetOutputSize(px: number): void { this.eqnOutputSize = +px; this.renderEqnPreview(); }

  // Strip MathLive-only artifacts so MathJax parses the LaTeX cleanly. MathLive's style macros
  // (\mathbf, \mathsf, \mathtt, \mathbb, \mathscr, \mathfrak, \textcolor, \underline) are all natively
  // supported by MathJax (color via the loaded [tex]/color package).
  private normalizeLatex(s: string): string {
    return s
      .replace(/\\placeholder\[[^\]]*\]\{\}/g, '')
      .replace(/\\placeholder\{\}/g, '');
  }

  private setEqnMessage(msg: string, type: 'error' | 'success'): void {
    this.eqnMessage = msg;
    this.eqnMessageType = type;
    if (type === 'success') {
      setTimeout(() => { this.eqnMessage = ''; this.eqnMessageType = ''; }, 3000);
    }
  }

  // --- Export ---
  copyEqnSvg(): void {
    if (!this.eqnSvgMarkup) { this.setEqnMessage('Nothing to copy yet.', 'error'); return; }
    navigator.clipboard.writeText(this.eqnSvgMarkup)
      .then(() => this.setEqnMessage('SVG copied — paste into Inkscape (Edit → Paste).', 'success'))
      .catch(() => this.setEqnMessage('Clipboard blocked by the browser.', 'error'));
  }

  downloadEqnSvg(): void {
    if (!this.eqnSvgMarkup) { this.setEqnMessage('Nothing to download yet.', 'error'); return; }
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + this.eqnSvgMarkup;
    saveAs(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }), 'equation.svg');
    this.setEqnMessage('SVG downloaded.', 'success');
  }

  async copyEqnPng(): Promise<void> {
    try {
      const canvas = await this.svgToCanvas();
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) { this.setEqnMessage('Could not create PNG.', 'error'); return; }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      this.setEqnMessage('PNG image copied to clipboard.', 'success');
    } catch {
      this.setEqnMessage('Could not copy PNG (browser may block image clipboard).', 'error');
    }
  }

  async downloadEqnPng(): Promise<void> {
    try {
      const canvas = await this.svgToCanvas();
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) { this.setEqnMessage('Could not create PNG.', 'error'); return; }
      saveAs(blob, 'equation.png');
      this.setEqnMessage('PNG downloaded.', 'success');
    } catch {
      this.setEqnMessage('Could not create PNG.', 'error');
    }
  }

  // Rasterize the current SVG to a high-resolution canvas. The SVG is resized to the FINAL target
  // pixel dimensions before rasterizing so the vector is drawn crisply (no blurry upscaling).
  // The PNG is rendered at a high internal density (independent of the on-screen "Equation size")
  // so a copied/downloaded PNG looks as sharp as the vector SVG.
  private svgToCanvas(): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      if (!this.eqnSvgMarkup || this.eqnPxW < 1) { reject(new Error('no svg')); return; }
      const RENDER_FONT_PX = 256;   // rasterize as if the equation were this size -> SVG-like crispness
      const MAX_EDGE = 8192;        // keep within browser canvas limits
      const quality = RENDER_FONT_PX / this.eqnOutputPx;
      let scale = (this.eqnPngScale || 1) * quality;
      const longest = Math.max(this.eqnPxW, this.eqnPxH) * scale;
      if (longest > MAX_EDGE) scale *= MAX_EDGE / longest;   // clamp the largest edge
      const targetW = Math.max(1, Math.round(this.eqnPxW * scale));
      const targetH = Math.max(1, Math.round(this.eqnPxH * scale));

      // Parse + resize the SVG root to the target resolution, then serialize.
      let markup = this.eqnSvgMarkup;
      try {
        const doc = new DOMParser().parseFromString(this.eqnSvgMarkup, 'image/svg+xml');
        const root = doc.documentElement;
        root.setAttribute('width', String(targetW));
        root.setAttribute('height', String(targetH));
        markup = new XMLSerializer().serializeToString(root);
      } catch { /* fall back to original markup */ }

      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(markup)));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('no ctx')); return; }
        if (!this.eqnTransparentBg) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('img load failed'));
      img.src = 'data:image/svg+xml;base64,' + svg64;
    });
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
    voltage: 400,            // switch-node voltage swing (V) — for power loss
    current: 10,             // switch current (A) — for the peak-voltage estimate
    switchingFreq: 50,       // switching frequency (kHz)
    // --- TI seven-step RC method (measured on a scope) ---
    ringFreqUnsnubbed: 19.2, // f0: ring frequency with NO snubber (MHz)
    addedCap: 100,           // C1: capacitor added to shift the ring frequency (pF)
    ringFreqShifted: 12.0,   // f1: ring frequency WITH C1 added (MHz)
    // --- parasitic method (RCD / TVS clamp) ---
    deviceCoss: 100,         // device output capacitance (pF)
    strayInductance: 50,     // stray / leakage inductance (nH)
    clampRipple: 80,         // RCD: allowable clamp overshoot dV above the rail (V)
    snubberType: 'rc'        // rc (TI 7-step) | rcd | clamp
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
    freqRatio: number;     // m = f0/f1 (TI step 3)
    parasiticC: number;    // C0 in pF (TI step 4)
    parasiticL: number;    // L in nH  (TI step 5)
    recommendation: string;
  } | null = null;

  calculateSnubber(): void {
    const V = this.snubberInputs.voltage;
    const I = this.snubberInputs.current;
    const fsw = this.snubberInputs.switchingFreq * 1000; // Hz

    let Cs = 0, Rs = 0, Vpk_with = 0, Ploss = 0, zeta = 0;
    let clampVoltage = 0, diode = 'N/A', recommendation = '';
    let f0 = 0, Vpk_without = 0, parasiticC = 0, parasiticL = 0, m = 0;

    if (this.snubberInputs.snubberType === 'rc') {
      // ===== TI "Power Tips: Calculate an R-C Snubber in Seven Steps" (SSZTBC7) =====
      // Measurement-based: shift the ring frequency with a known cap, then back out the parasitics.
      const f0r = this.snubberInputs.ringFreqUnsnubbed * 1e6;  // step 1: f0 (Hz), no snubber
      const f1r = this.snubberInputs.ringFreqShifted * 1e6;    // step 2: f1 (Hz) with C1 added
      const C1 = this.snubberInputs.addedCap * 1e-12;          // step 2: added capacitor (F)
      m = f0r / f1r;                                           // step 3: m = f0 / f1
      const C0 = C1 / (m * m - 1);                             // step 4: parasitic capacitance
      const Lp = (m * m - 1) / (Math.pow(2 * Math.PI * f0r, 2) * C1); // step 5: parasitic inductance
      Cs = 3 * C0;                                             // step 6: C_snub = 3·C0
      Rs = Math.sqrt(Lp / C0);                                // step 7: R_snub = √(L / C0)
      Ploss = Cs * V * V * fsw;                               // snubber loss ≈ C_snub·V²·f_sw

      const Z0 = Math.sqrt(Lp / C0);
      zeta = Rs / (2 * Math.sqrt(Lp / Cs));
      Vpk_without = V + I * Z0;
      Vpk_with = V + I * Z0 * Math.exp(-zeta * Math.PI);
      f0 = f0r;
      parasiticC = C0;
      parasiticL = Lp;
      recommendation = `TI 7-step → parasitics L₀≈${(Lp * 1e9).toFixed(0)} nH, C₀≈${(C0 * 1e12).toFixed(0)} pF. ` +
        `Start with C_snub≈${(Cs * 1e12).toFixed(0)} pF and R_snub≈${Rs.toFixed(0)} Ω (rated ≥ ${Ploss.toFixed(2)} W). ` +
        `Larger C_snub cuts the spike further but raises R loss.`;
    } else {
      // ===== Parasitic-LC method (RCD / TVS clamp) =====
      const Coss = this.snubberInputs.deviceCoss * 1e-12;
      const Ls = this.snubberInputs.strayInductance * 1e-9;
      f0 = 1 / (2 * Math.PI * Math.sqrt(Ls * Coss));
      const Z0 = Math.sqrt(Ls / Coss);
      Vpk_without = V + I * Z0;
      parasiticC = Coss;
      parasiticL = Ls;

      if (this.snubberInputs.snubberType === 'rcd') {
        // ===== Daycounter RCD clamping snubber =====
        // Cap sized to absorb the leakage energy within an allowable overshoot dV above the rail.
        const dV = this.snubberInputs.clampRipple;
        Cs = (Ls * I * I) / (dV * (dV + 2 * V));   // C = L·I² / (dV·(dV + 2V))
        Rs = 10 / (fsw * Cs);                       // R = 10 / (f·C)  (discharge time constant ≈ 10/f)
        Ploss = 0.5 * Ls * I * I * fsw;             // P = ½·L·I²·f  (leakage energy per cycle)
        zeta = 1;
        clampVoltage = V + dV;                      // clamp cap settles to rail + overshoot
        Vpk_with = clampVoltage;
        diode = `Fast/ultrafast recovery, V_RRM > ${Math.ceil(clampVoltage * 1.5)}V, I_F > ${Math.ceil(I * 1.5)}A`;
        recommendation = `Daycounter RCD clamp: C = L·I²/(dV(dV+2V)) ≈ ${(Cs * 1e9).toFixed(2)} nF, ` +
          `R = 10/(f·C) ≈ ${Rs >= 1000 ? (Rs / 1000).toFixed(1) + ' kΩ' : Rs.toFixed(0) + ' Ω'}, ` +
          `P = ½·L·I²·f ≈ ${Ploss.toFixed(2)} W. Clamps the leakage spike to ≈ ${(V + dV).toFixed(0)} V; use an ultrafast diode (trr < 50 ns).`;
      } else {
        clampVoltage = V * 1.2;
        Cs = 0; Rs = 0; zeta = 1;
        Vpk_with = clampVoltage;
        Ploss = 0.5 * Ls * Math.pow(I, 2) * fsw;
        diode = `TVS: V_BR = ${Math.ceil(clampVoltage)}V, P_peak > ${Math.ceil(0.5 * Ls * I * I * 1e6)}mJ`;
        recommendation = `TVS clamp is most effective for hard clamping. Ensure TVS can handle peak energy.`;
      }
    }

    this.snubberResults = {
      snubberC: Cs * 1e9, // nF
      snubberR: Rs,
      snubberD: diode,
      clampVoltage: clampVoltage,
      peakVoltageWithout: Vpk_without,
      peakVoltageWith: Vpk_with,
      snubberPowerLoss: Ploss,
      dampingFactor: zeta,
      resonantFreq: f0 / 1e6, // MHz
      freqRatio: m,
      parasiticC: parasiticC * 1e12, // pF
      parasiticL: parasiticL * 1e9,  // nH
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
        color: '#C4937A'
      };
    } else if (this.switchingFrequency <= 80) {
      return {
        type: 'SiC MOSFET',
        description: 'Optimal for medium-high frequency (2-80 kHz). Lower switching losses, higher efficiency than IGBT.',
        color: '#7EA8B8'
      };
    } else {
      return {
        type: 'GaN MOSFET',
        description: 'Best for high frequency (80-100 kHz). Fastest switching, lowest losses at high frequencies.',
        color: '#9BB8A8'
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
    if (eff >= 95) return '#9BB8A8';
    if (eff >= 90) return '#D4A574';
    return '#C4937A';
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
    if (lossWatts >= 500) return '#C4937A';
    if (lossWatts >= 200) return '#D4A574';
    if (lossWatts >= 100) return '#B8926A';
    return '#9BB8A8';
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
    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }
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
