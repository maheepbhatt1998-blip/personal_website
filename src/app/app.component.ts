import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
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
  aboutMe = `I am a PhD student in Electrical and Computer Engineering at the University of Wisconsin–Madison (WEMPEC), working on advanced power electronics and motor-drive systems. My research focuses on current source inverter (CSI) architectures and wide-bandgap devices, particularly GaN- and SiC-based bidirectional switches, with emphasis on high-frequency converter design, gate drives, and experimental characterization. I combine simulation-driven design with hands-on hardware development to create efficient, practical power-electronic solutions for electric vehicles, UPS, and energy systems.`;

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

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
