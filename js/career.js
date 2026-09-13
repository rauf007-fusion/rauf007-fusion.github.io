/*
 * Career data, transcribed from the CV (August 2026). One source for both the
 * Gantt and the phone-width list, so the two can never disagree.
 *
 * Dates are 'YYYY-MM'. end: null means the role is current - its bar runs to
 * today's date, whenever the page is opened.
 */
window.CAREER = {
  sectors: [
    { id: 1, name: 'Engineering & design' },
    { id: 2, name: 'Offshore oil & gas' },
    { id: 3, name: 'Rail' },
    { id: 4, name: 'Business' },
    { id: 5, name: 'Construction' },
    { id: 6, name: 'Energy & transmission' },
  ],

  roles: [
    {
      title: 'Senior Project Planner', org: 'Balfour Beatty', sector: 6,
      start: '2026-08', end: null,
      project: 'Skye Reinforcement OHL & UGC Programme, Scotland — £300M+',
      points: [
        'Lead planner for the Skye Reinforcement transmission scheme, covering overhead line (OHL) and underground cable (UGC) delivery across a programme valued at over £300M.',
        'Own the Part A (Design) programme — periodic progress updates in Primavera P6, accurate percent complete, actual dates and remaining duration, and design deliverable status against key client milestones.',
        'Developed and submitted the Part B (Construction) tender Clause 31 programme under NEC4 ECC, incorporating planned Completion, method statements, key dates, provisions for float, time risk allowance and health and safety requirements.',
        'Maintain integrated logic across design, consents, procurement, enabling works, outage windows and construction, so interfaces and access constraints are correctly represented.',
        'Analyse critical and near-critical paths each period, identify emerging schedule threats, and issue early warnings to the project and commercial teams.',
        'Support compensation event and change management through schedule impact analysis and supporting programme evidence.',
      ],
    },
    {
      title: 'Senior Planner', org: 'M Group Ltd', sector: 6,
      start: '2025-08', end: '2026-08',
      project: 'Overhead Lines (OHL) Infrastructure Programme, Scotland',
      points: [
        'Led planning and scheduling for major OHL infrastructure works, supporting NEC4-aligned programme governance and reporting.',
        'Developed and maintained integrated multi-level programmes in Primavera P6 and MS Project, linking engineering, procurement and construction.',
        'Developed a £300M tender programme and supporting planning narrative, aligned to client (SPEN) requirements across three transmission routes.',
        'Produced weekly and monthly schedule updates, dashboards, critical path analysis, early-warning alerts and impact assessments for leadership review.',
      ],
    },
    {
      title: 'Senior Project Controls Engineer', org: 'Turner & Townsend', sector: 6,
      start: '2023-06', end: '2023-12',
      project: 'BP ZERFD Energy Infrastructure Programme — ~£75M',
      points: [
        'Developed multi-level schedules and a clear Basis of Schedule to establish planning standards and controls governance.',
        'Applied earned value principles and variance analysis to improve forecasting quality and support timely management intervention.',
        'Conducted critical path analysis and schedule optimisation to reduce slippage exposure and improve delivery predictability.',
        'Prepared executive reporting packs with visual KPIs for faster stakeholder decisions.',
        'Contributed to early-stage planning on a high-level programme that supported successful award outcomes.',
      ],
    },
    {
      title: 'Senior Project Planner', org: 'A.F. Engineering Works', sector: 5,
      start: '2018-01', end: '2023-02',
      project: 'High-rise construction & infrastructure — 6 concurrent projects, ~£120M',
      points: [
        'Managed planning and schedule control for six concurrent construction projects, producing integrated baselines and update cycles.',
        'Standardised planning methodologies and templates, reducing schedule creation time and improving reporting consistency.',
        'Implemented resource levelling to improve workforce utilisation and support efficient site mobilisation.',
        'Ran weekly schedule health checks that surfaced critical issues 3–4 weeks earlier, enabling proactive corrective action.',
        'Mentored a team of five junior planners — three progressed to mid-level roles within 18 months.',
        'Introduced S-curves, heat maps and milestone trackers to strengthen executive engagement.',
      ],
    },
    {
      title: 'Sub Postmaster / Director', org: 'Peterculter Post Office', sector: 4,
      start: '2014-04', end: '2018-01',
      project: 'Retail and service business — ~£350K annual revenue',
      points: [
        'Managed day-to-day operations for a retail and service business with annual revenue of approximately £350K.',
        'Owned an annual budget of approximately £200K with consistent cost control, achieving up to 10% under budget.',
        'Led and developed a team of six, maintaining strong service performance and retention.',
      ],
    },
    {
      title: 'Project Planner', org: 'Network Rail', sector: 3,
      start: '2011-03', end: '2014-04',
      project: 'Rail Infrastructure Maintenance & Upgrade Programme — ~£45M',
      points: [
        'Developed and maintained Primavera P6 schedules for rail infrastructure maintenance and upgrade works.',
        'Coordinated with more than 12 stakeholders to integrate interdependent schedules and manage interfaces.',
        'Performed what-if scenario analysis to identify optimal execution strategies and avoid delay and cost impacts.',
        'Assessed schedule impacts for more than 75 proposed changes, with variance reporting.',
      ],
    },
    {
      title: 'Senior Project Planner', org: 'Dynamic Equipment', sector: 2,
      start: '2000-05', end: '2011-03',
      project: 'Offshore oil & gas equipment installation & maintenance — North Sea / Canada',
      points: [
        'Planned and controlled installation and maintenance programmes for offshore equipment, integrating logistics with execution sequencing.',
        'Developed long-term planning strategies to optimise lifecycle activities and resource use across multiple work fronts.',
        'Conducted schedule risk assessments and implemented mitigation for high-risk activities.',
        'Created planning standards adopted across the organisation.',
      ],
    },
    {
      title: 'Mechanical Design Engineer', org: 'A.J. Cruickshanks', sector: 1,
      start: '1997-06', end: '2000-04',
      project: 'Mechanical design and manufacturing readiness',
      points: [
        'Produced mechanical designs and technical documentation in AutoCAD, supporting manufacturing readiness and delivery planning.',
        'Coordinated with production teams to improve design feasibility and reduce rework.',
      ],
    },
  ],

  education: [
    { when: '1994-06', label: 'BSc, Computer Aided Engineering', org: 'Glasgow Caledonian University' },
    { when: '1994-09', label: 'AutoCAD 2D/3D', org: 'City & Guilds' },
    { when: '1997-06', label: 'PGDip, Maintenance Systems & Project Management', org: 'Glasgow Caledonian University' },
  ],

  certifications: [
    { when: '1998-06', label: 'Microsoft Certified Professional', org: 'Mari Group' },
    { when: '2019-06', label: 'Schedule Optimisation Techniques', org: 'Planning Planet' },
    { when: '2020-06', label: 'Oracle Primavera P6 EPPM Advanced', org: 'Oracle University' },
    { when: '2021-06', label: 'Advanced Risk Management', org: 'APM' },
    { when: '2022-06', label: 'Earned Value Management Systems', org: 'PMI' },
    { when: '2023-03', label: 'PRINCE2 Foundation & Practitioner', org: 'PeopleCert' },
    { when: '2023-05', label: 'Project Planning & Control Practitioner', org: 'APMG International' },
  ],
};
