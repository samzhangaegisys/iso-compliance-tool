export interface IsoControlData {
  ref: string;
  title: string;
  description: string;
}

export interface IsoClauseData {
  number: string;
  title: string;
  controls: IsoControlData[];
}

export interface IsoStandardData {
  code: string;
  name: string;
  version: string;
  description: string;
  totalControls: number;
  clauses: IsoClauseData[];
}

export const ISO_STANDARDS: IsoStandardData[] = [
  {
    code: "ISO27001",
    name: "ISO/IEC 27001",
    version: "2022",
    description:
      "Information security management systems — Requirements. Provides a framework for establishing, implementing, maintaining, and continually improving an information security management system.",
    totalControls: 93,
    clauses: [
      {
        number: "A.5",
        title: "Organizational Controls",
        controls: [
          {
            ref: "A.5.1",
            title: "Policies for information security",
            description:
              "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel.",
          },
          {
            ref: "A.5.2",
            title: "Information security roles and responsibilities",
            description:
              "Information security roles and responsibilities shall be defined and allocated according to the organisation needs.",
          },
          {
            ref: "A.5.3",
            title: "Segregation of duties",
            description:
              "Conflicting duties and conflicting areas of responsibility shall be segregated.",
          },
          {
            ref: "A.5.7",
            title: "Threat intelligence",
            description:
              "Information relating to information security threats shall be collected and analysed to produce threat intelligence.",
          },
          {
            ref: "A.5.8",
            title: "Information security in project management",
            description:
              "Information security shall be integrated into project management.",
          },
          {
            ref: "A.5.9",
            title: "Inventory of information and other associated assets",
            description:
              "An inventory of information and other associated assets, including owners, shall be developed and maintained.",
          },
          {
            ref: "A.5.12",
            title: "Classification of information",
            description:
              "Information shall be classified according to the information security needs of the organisation based on confidentiality, integrity, availability and relevant interested party requirements.",
          },
          {
            ref: "A.5.15",
            title: "Access control",
            description:
              "Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.",
          },
          {
            ref: "A.5.16",
            title: "Identity management",
            description:
              "The full life cycle of identities shall be managed.",
          },
          {
            ref: "A.5.23",
            title: "Information security for use of cloud services",
            description:
              "Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organisation's information security requirements.",
          },
        ],
      },
      {
        number: "A.6",
        title: "People Controls",
        controls: [
          {
            ref: "A.6.1",
            title: "Screening",
            description:
              "Background verification checks on all candidates to become personnel shall be carried out prior to joining the organisation and on an ongoing basis.",
          },
          {
            ref: "A.6.2",
            title: "Terms and conditions of employment",
            description:
              "The employment contractual agreements shall state the personnel's and the organisation's responsibilities for information security.",
          },
          {
            ref: "A.6.3",
            title: "Information security awareness, education and training",
            description:
              "Personnel of the organisation and relevant interested parties shall receive appropriate information security awareness, education and training.",
          },
          {
            ref: "A.6.4",
            title: "Disciplinary process",
            description:
              "A disciplinary process shall be formalized and communicated to take actions against personnel and other relevant interested parties who have committed an information security policy violation.",
          },
        ],
      },
      {
        number: "A.7",
        title: "Physical Controls",
        controls: [
          {
            ref: "A.7.1",
            title: "Physical security perimeters",
            description:
              "Security perimeters shall be defined and used to protect areas that contain information and other associated assets.",
          },
          {
            ref: "A.7.2",
            title: "Physical entry",
            description:
              "Secure areas shall be protected by appropriate entry controls and access points.",
          },
          {
            ref: "A.7.4",
            title: "Physical security monitoring",
            description:
              "Premises shall be continuously monitored for unauthorized physical access.",
          },
          {
            ref: "A.7.6",
            title: "Working in secure areas",
            description:
              "Security measures for working in secure areas shall be designed and implemented.",
          },
          {
            ref: "A.7.8",
            title: "Equipment siting and protection",
            description:
              "Equipment shall be sited securely and protected.",
          },
        ],
      },
      {
        number: "A.8",
        title: "Technological Controls",
        controls: [
          {
            ref: "A.8.1",
            title: "User endpoint devices",
            description:
              "Information stored on, processed by or accessible via user endpoint devices shall be protected.",
          },
          {
            ref: "A.8.2",
            title: "Privileged access rights",
            description:
              "The allocation and use of privileged access rights shall be restricted and managed.",
          },
          {
            ref: "A.8.5",
            title: "Secure authentication",
            description:
              "Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.",
          },
          {
            ref: "A.8.7",
            title: "Protection against malware",
            description:
              "Protection against malware shall be implemented and supported by appropriate user awareness.",
          },
          {
            ref: "A.8.8",
            title: "Management of technical vulnerabilities",
            description:
              "Information about technical vulnerabilities of information systems in use shall be obtained, the organisation's exposure to such vulnerabilities shall be evaluated.",
          },
          {
            ref: "A.8.16",
            title: "Monitoring activities",
            description:
              "Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.",
          },
          {
            ref: "A.8.24",
            title: "Use of cryptography",
            description:
              "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.",
          },
          {
            ref: "A.8.28",
            title: "Secure coding",
            description:
              "Secure coding principles shall be applied to software development.",
          },
        ],
      },
    ],
  },
  {
    code: "ISO9001",
    name: "ISO 9001",
    version: "2015",
    description:
      "Quality management systems — Requirements. Sets out the criteria for a quality management system and is the only standard in the ISO 9000 family that can be certified to.",
    totalControls: 85,
    clauses: [
      {
        number: "4",
        title: "Context of the Organisation",
        controls: [
          {
            ref: "4.1",
            title: "Understanding the organisation and its context",
            description:
              "The organisation shall determine external and internal issues that are relevant to its purpose and its strategic direction.",
          },
          {
            ref: "4.2",
            title: "Understanding the needs and expectations of interested parties",
            description:
              "The organisation shall determine the interested parties that are relevant to the QMS and their requirements.",
          },
          {
            ref: "4.3",
            title: "Determining the scope of the QMS",
            description:
              "The organisation shall determine the boundaries and applicability of the QMS to establish its scope.",
          },
          {
            ref: "4.4",
            title: "Quality management system and its processes",
            description:
              "The organisation shall establish, implement, maintain and continually improve a QMS, including the processes needed.",
          },
        ],
      },
      {
        number: "5",
        title: "Leadership",
        controls: [
          {
            ref: "5.1",
            title: "Leadership and commitment",
            description:
              "Top management shall demonstrate leadership and commitment with respect to the QMS.",
          },
          {
            ref: "5.2",
            title: "Policy",
            description:
              "Top management shall establish, implement and maintain a quality policy.",
          },
          {
            ref: "5.3",
            title: "Organisational roles, responsibilities and authorities",
            description:
              "Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated and understood.",
          },
        ],
      },
      {
        number: "6",
        title: "Planning",
        controls: [
          {
            ref: "6.1",
            title: "Actions to address risks and opportunities",
            description:
              "The organisation shall determine the risks and opportunities that need to be addressed.",
          },
          {
            ref: "6.2",
            title: "Quality objectives and planning to achieve them",
            description:
              "The organisation shall establish quality objectives at relevant functions, levels and processes.",
          },
          {
            ref: "6.3",
            title: "Planning of changes",
            description:
              "When the organisation determines the need for changes to the QMS, the changes shall be carried out in a planned manner.",
          },
        ],
      },
      {
        number: "8",
        title: "Operation",
        controls: [
          {
            ref: "8.1",
            title: "Operational planning and control",
            description:
              "The organisation shall plan, implement, control, monitor and review the processes needed to meet the requirements for the provision of products and services.",
          },
          {
            ref: "8.3",
            title: "Design and development of products and services",
            description:
              "The organisation shall establish, implement and maintain a design and development process.",
          },
          {
            ref: "8.4",
            title: "Control of externally provided processes, products and services",
            description:
              "The organisation shall ensure that externally provided processes, products and services conform to requirements.",
          },
          {
            ref: "8.5",
            title: "Production and service provision",
            description:
              "The organisation shall implement production and service provision under controlled conditions.",
          },
          {
            ref: "8.7",
            title: "Control of nonconforming outputs",
            description:
              "The organisation shall ensure that outputs that do not conform to requirements are identified and controlled.",
          },
        ],
      },
    ],
  },
  {
    code: "ISO14001",
    name: "ISO 14001",
    version: "2015",
    description:
      "Environmental management systems — Requirements with guidance for use. Provides a framework for an effective environmental management system (EMS) that organisations can follow.",
    totalControls: 62,
    clauses: [
      {
        number: "4",
        title: "Context of the Organisation",
        controls: [
          {
            ref: "4.1",
            title: "Understanding the organisation and its context",
            description:
              "The organisation shall determine external and internal issues, including environmental conditions, relevant to its purpose.",
          },
          {
            ref: "4.2",
            title: "Understanding the needs and expectations of interested parties",
            description:
              "The organisation shall determine interested parties and their relevant needs and expectations.",
          },
          {
            ref: "4.3",
            title: "Determining the scope of the EMS",
            description:
              "The organisation shall determine the boundaries and applicability of the EMS to establish its scope.",
          },
          {
            ref: "4.4",
            title: "Environmental management system",
            description:
              "The organisation shall establish, implement, maintain and continually improve an EMS.",
          },
        ],
      },
      {
        number: "6",
        title: "Planning",
        controls: [
          {
            ref: "6.1.1",
            title: "General — Risks and opportunities",
            description:
              "The organisation shall establish, implement and maintain processes needed to meet the requirements for planning.",
          },
          {
            ref: "6.1.2",
            title: "Environmental aspects",
            description:
              "The organisation shall determine the environmental aspects of its activities, products and services that it can control.",
          },
          {
            ref: "6.1.3",
            title: "Compliance obligations",
            description:
              "The organisation shall determine and have access to the compliance obligations related to its environmental aspects.",
          },
          {
            ref: "6.2",
            title: "Environmental objectives and planning to achieve them",
            description:
              "The organisation shall establish environmental objectives at relevant functions, levels and processes.",
          },
        ],
      },
      {
        number: "7",
        title: "Support",
        controls: [
          {
            ref: "7.1",
            title: "Resources",
            description:
              "The organisation shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the EMS.",
          },
          {
            ref: "7.2",
            title: "Competence",
            description:
              "The organisation shall determine the necessary competence of persons doing work that affects its environmental performance.",
          },
          {
            ref: "7.3",
            title: "Awareness",
            description:
              "Persons doing work under the organisation's control shall be made aware of the environmental policy and their contribution to the EMS.",
          },
          {
            ref: "7.4",
            title: "Communication",
            description:
              "The organisation shall establish, implement and maintain processes needed for internal and external communication relevant to the EMS.",
          },
        ],
      },
      {
        number: "8",
        title: "Operation",
        controls: [
          {
            ref: "8.1",
            title: "Operational planning and control",
            description:
              "The organisation shall establish, implement, control and maintain the processes needed to meet EMS requirements.",
          },
          {
            ref: "8.2",
            title: "Emergency preparedness and response",
            description:
              "The organisation shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations.",
          },
        ],
      },
    ],
  },
  {
    code: "ISO45001",
    name: "ISO 45001",
    version: "2018",
    description:
      "Occupational health and safety management systems — Requirements. Provides a framework for managing OH&S risks and opportunities to prevent work-related injury and ill health.",
    totalControls: 74,
    clauses: [
      {
        number: "4",
        title: "Context of the Organisation",
        controls: [
          {
            ref: "4.1",
            title: "Understanding the organisation and its context",
            description:
              "The organisation shall determine external and internal issues that are relevant to its purpose and affect its ability to achieve intended outcomes.",
          },
          {
            ref: "4.2",
            title: "Understanding the needs and expectations of workers and other interested parties",
            description:
              "The organisation shall determine interested parties and their relevant needs and expectations.",
          },
          {
            ref: "4.3",
            title: "Determining the scope of the OH&S MS",
            description:
              "The organisation shall determine the boundaries and applicability of the OH&S management system.",
          },
          {
            ref: "4.4",
            title: "OH&S management system",
            description:
              "The organisation shall establish, implement, maintain and continually improve an OH&S management system.",
          },
        ],
      },
      {
        number: "6",
        title: "Planning",
        controls: [
          {
            ref: "6.1.1",
            title: "General — Risks and opportunities",
            description:
              "When planning for the OH&S management system, the organisation shall consider the issues and requirements.",
          },
          {
            ref: "6.1.2",
            title: "Hazard identification and assessment of risks and opportunities",
            description:
              "The organisation shall establish, implement and maintain processes for proactive hazard identification.",
          },
          {
            ref: "6.1.3",
            title: "Determination of legal requirements and other requirements",
            description:
              "The organisation shall establish, implement and maintain processes to determine and have access to current legal requirements.",
          },
          {
            ref: "6.1.4",
            title: "Planning action",
            description:
              "The organisation shall plan actions to address OH&S risks and opportunities.",
          },
          {
            ref: "6.2",
            title: "OH&S objectives and planning to achieve them",
            description:
              "The organisation shall establish OH&S objectives at relevant functions and levels.",
          },
        ],
      },
      {
        number: "8",
        title: "Operation",
        controls: [
          {
            ref: "8.1.1",
            title: "Operational planning and control — General",
            description:
              "The organisation shall plan, implement, control, maintain and improve the processes needed to meet requirements of the OH&S management system.",
          },
          {
            ref: "8.1.2",
            title: "Eliminating hazards and reducing OH&S risks",
            description:
              "The organisation shall establish, implement and maintain processes for the elimination of hazards and reduction of OH&S risks.",
          },
          {
            ref: "8.1.3",
            title: "Management of change",
            description:
              "The organisation shall establish a process for the implementation and control of planned temporary and permanent changes.",
          },
          {
            ref: "8.2",
            title: "Emergency preparedness and response",
            description:
              "The organisation shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations.",
          },
          {
            ref: "8.4",
            title: "Procurement",
            description:
              "The organisation shall establish, implement and maintain processes to control the procurement of products and services.",
          },
        ],
      },
      {
        number: "10",
        title: "Improvement",
        controls: [
          {
            ref: "10.1",
            title: "General",
            description:
              "The organisation shall determine opportunities for improvement and implement necessary actions to achieve the intended outcomes of the OH&S management system.",
          },
          {
            ref: "10.2",
            title: "Incident, nonconformity and corrective action",
            description:
              "The organisation shall establish, implement and maintain processes for reporting, investigating and taking action on incidents and nonconformities.",
          },
          {
            ref: "10.3",
            title: "Continual improvement",
            description:
              "The organisation shall continually improve the suitability, adequacy and effectiveness of the OH&S management system.",
          },
        ],
      },
    ],
  },
  {
    code: "ISO42001",
    name: "ISO/IEC 42001",
    version: "2023",
    description:
      "Artificial intelligence management systems — Requirements. Provides requirements for an AI management system (AIMS) for organisations that develop, provide or use AI-based products or services.",
    totalControls: 58,
    clauses: [
      {
        number: "4",
        title: "Context of the Organisation",
        controls: [
          {
            ref: "4.1",
            title: "Understanding the organisation and its context",
            description:
              "The organisation shall determine external and internal issues relevant to its purpose and its AI objectives.",
          },
          {
            ref: "4.2",
            title: "Understanding the needs and expectations of interested parties",
            description:
              "The organisation shall determine interested parties and their requirements relevant to AI.",
          },
          {
            ref: "4.3",
            title: "Determining the scope of the AI management system",
            description:
              "The organisation shall determine the boundaries and applicability of the AIMS.",
          },
          {
            ref: "4.4",
            title: "AI management system",
            description:
              "The organisation shall establish, implement, maintain and continually improve an AIMS.",
          },
        ],
      },
      {
        number: "5",
        title: "Leadership",
        controls: [
          {
            ref: "5.1",
            title: "Leadership and commitment",
            description:
              "Top management shall demonstrate leadership and commitment with respect to the AIMS.",
          },
          {
            ref: "5.2",
            title: "AI policy",
            description:
              "Top management shall establish an AI policy appropriate to the purpose of the organisation.",
          },
          {
            ref: "5.3",
            title: "Organisational roles, responsibilities and authorities",
            description:
              "Top management shall ensure that responsibilities and authorities for relevant AI roles are assigned.",
          },
        ],
      },
      {
        number: "6",
        title: "Planning",
        controls: [
          {
            ref: "6.1",
            title: "Actions to address risks and opportunities",
            description:
              "The organisation shall determine AI-related risks and opportunities that need to be addressed.",
          },
          {
            ref: "6.1.2",
            title: "AI risk assessment",
            description:
              "The organisation shall establish, implement and maintain an AI risk assessment process.",
          },
          {
            ref: "6.1.3",
            title: "AI risk treatment",
            description:
              "The organisation shall establish and implement an AI risk treatment process.",
          },
          {
            ref: "6.2",
            title: "AI objectives and planning to achieve them",
            description:
              "The organisation shall establish AI objectives at relevant functions, levels and processes.",
          },
        ],
      },
      {
        number: "8",
        title: "Operation",
        controls: [
          {
            ref: "8.1",
            title: "Operational planning and control",
            description:
              "The organisation shall plan, implement, control, maintain and improve the processes needed to meet AI management requirements.",
          },
          {
            ref: "8.2",
            title: "AI risk assessment process",
            description:
              "The organisation shall perform AI risk assessments at planned intervals or when significant changes are proposed.",
          },
          {
            ref: "8.3",
            title: "AI risk treatment process",
            description:
              "The organisation shall implement the AI risk treatment plan.",
          },
          {
            ref: "8.4",
            title: "Documentation of AI system information",
            description:
              "The organisation shall establish, implement and maintain documentation for AI systems including purpose, design decisions, and performance metrics.",
          },
          {
            ref: "8.5",
            title: "AI impact assessment",
            description:
              "The organisation shall establish, implement and maintain processes for assessing impacts of AI systems on individuals and society.",
          },
          {
            ref: "8.6",
            title: "AI system lifecycle",
            description:
              "The organisation shall manage AI system lifecycle from design through decommissioning with appropriate controls at each phase.",
          },
          {
            ref: "8.7",
            title: "Data management for AI",
            description:
              "The organisation shall establish, implement and maintain processes for data management in the context of AI systems.",
          },
        ],
      },
    ],
  },
];

export function getStandardByCode(code: string): IsoStandardData | undefined {
  return ISO_STANDARDS.find((s) => s.code === code);
}

export function getAllControls(standardCode: string): IsoControlData[] {
  const standard = getStandardByCode(standardCode);
  if (!standard) return [];
  return standard.clauses.flatMap((c) => c.controls);
}
