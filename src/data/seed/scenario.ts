import { BuildingScenario } from '../../types';

export const seedBuildingScenario: BuildingScenario = {
  id: 'scenario-facility-04',
  title: 'Basic Duties — Facility 04 Realistic Inspection Simulator',
  description:
    'Comprehensive active patrol simulation. Navigate through all key zones of AEGIS Facility 04, inspect realistic high-definition environments, detect unauthorized access or environmental hazards, and log formal incident reports.',
  buildingImage: '/assets/facility-inspection/facility-exterior.jpg',
  instructions:
    'Select each room hotspot on the facility exterior to enter and inspect the scene. Answer whether irregularities are present, pinpoint the exact faulty object, file an official incident report, and certify all 6 required zones to advance.',
  minimumRoomsRequired: 6,
  rooms: [
    {
      id: 'room-reception',
      name: 'Main Reception & Visitor Foyer',
      code: 'Zone 102',
      buildingCoordinates: { x: 50, y: 72, label: 'Zone 102 — Main Reception' },
      roomImage: '/assets/facility-inspection/rooms/reception.jpg',
      required: true,
      hasIrregularities: true,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: true,
      explanation:
        'An unattended black tactical duffel bag was discovered next to the guest armchair in the public reception area, violating the Clean Foyer and Unattended Baggage protocols.',
      correctFeedback:
        'Correct observation! An unattended parcel was identified in the public reception area. Standard protocol requires establishing a cordon and notifying the duty sergeant.',
      incorrectFeedback:
        'Irregularity missed. Public lobbies require strict vigilance regarding unattended bags or packages. Inspect the seating area again.',
      objects: [
        {
          id: 'obj-reception-duffel-bag',
          label: 'Unattended Black Duffel Bag',
          hotspot: { x: 32, y: 84, width: 16, height: 16, label: 'Unattended Duffel Bag' },
          objectType: 'hazard',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['security', 'physical-security'],
          incidentType: 'unattended-baggage',
          incidentDetails: 'Unattended tactical duffel bag beside visitor seating without an owner in sight.',
          feedbackCorrect:
            'Unattended baggage verified! Standard operating procedure requires verifying ownership, establishing a 15-meter cordon, and notifying the Duty Sergeant.',
          feedbackWhyItMatters:
            'Unattended parcels in public-facing lobbies present an immediate threat of explosive devices, contraband, or stolen corporate property.',
          severity: 'high',
        },
        {
          id: 'obj-reception-desk',
          label: 'Visitor Check-in Reception Desk',
          hotspot: { x: 80, y: 60, width: 24, height: 35, label: 'Reception Counter' },
          objectType: 'furniture',
          isExpectedTarget: false,
          feedbackCorrect: '',
          feedbackWhyItMatters: 'The reception desk is staffed and functioning normally.',
        },
        {
          id: 'obj-reception-turnstiles',
          label: 'Security Speedlanes & Turnstiles',
          hotspot: { x: 47, y: 52, width: 14, height: 20, label: 'Access Turnstiles' },
          objectType: 'access',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Turnstiles and optical speed gates are operational with security staff monitoring entry.',
        },
        {
          id: 'obj-reception-coffeetable',
          label: 'Visitor Coffee Table & Magazines',
          hotspot: { x: 10, y: 84, width: 18, height: 18, label: 'Lounge Table' },
          objectType: 'furniture',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The lounge seating and table are compliant.',
        },
      ],
      irregularities: [
        {
          id: 'irreg-unattended-bag',
          name: 'Unattended Suspicious Baggage',
          description: 'Black tactical duffel bag left unattended beside visitor seating without an owner in sight.',
          category: 'security',
          hotspot: { x: 32, y: 84, width: 16, height: 16 },
          feedbackCorrect:
            'Unattended baggage identified! Standard operating procedure requires verifying ownership, establishing a 15-meter cordon, and notifying the Duty Sergeant.',
          feedbackWhyItMatters:
            'Unattended parcels in public-facing lobbies present an immediate threat of explosive devices, contraband, or stolen corporate property.',
          severity: 'high',
        },
      ],
    },
    {
      id: 'room-server',
      name: 'Critical Server & Data Vault',
      code: 'Zone 201',
      buildingCoordinates: { x: 26, y: 44, label: 'Zone 201 — Server Vault' },
      roomImage: '/assets/facility-inspection/rooms/server-vault.jpg',
      required: true,
      hasIrregularities: true,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: true,
      explanation:
        'Server Cabinet Rack 19 (Zone A) was left wide open and unlocked, with tangled patch cords hanging loose and an active amber warning alert light.',
      correctFeedback:
        'Correct observation! An unsecured server cabinet with exposed patch cables and warning indicators was detected. Physical data vault racks must remain locked.',
      incorrectFeedback:
        'Irregularity missed. Look closely at the server cabinet doors and status indicators. One equipment rack is unlocked and open.',
      objects: [
        {
          id: 'obj-server-open-rack',
          label: 'Open Server Rack 19 & Dangling Cables',
          hotspot: { x: 72, y: 50, width: 28, height: 65, label: 'Rack 19 Open Cabinet' },
          objectType: 'equipment',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['security', 'compliance', 'equipment', 'physical-security'],
          incidentType: 'physical-security',
          incidentDetails: 'Server cabinet door left unsecured with exposed patch cabling and active fault LED.',
          feedbackCorrect:
            'Physical server compromise prevented! Server cabinet must be locked with physical keycard logging and IT Infrastructure alerted.',
          feedbackWhyItMatters:
            'Unsecured server racks expose proprietary enterprise databases to direct hardware tampering, physical packet sniffers, and severe airflow disruption.',
          severity: 'critical',
        },
        {
          id: 'obj-server-biometric-reader',
          label: 'Biometric Access Wall Reader',
          hotspot: { x: 4, y: 52, width: 6, height: 12, label: 'Biometric Reader' },
          objectType: 'access',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The wall access control reader is functional and actively securing the perimeter.',
        },
        {
          id: 'obj-server-cable-tray',
          label: 'Overhead Cable Management Tray',
          hotspot: { x: 35, y: 15, width: 34, height: 16, label: 'Cable Trays' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Overhead cable trays are neatly bundled and compliant with structured wiring standards.',
        },
        {
          id: 'obj-server-locked-racks',
          label: 'Secured Background Server Cabinets',
          hotspot: { x: 42, y: 52, width: 18, height: 46, label: 'Locked Cabinets' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'These adjacent server racks are properly locked with normal blue operational LEDs.',
        },
      ],
      irregularities: [
        {
          id: 'irreg-server-door',
          name: 'Unsecured Server Cabinet & Exposed Wiring',
          description: 'Server Rack 19 door left wide open with critical LED alert and dangling patch cables.',
          category: 'security',
          hotspot: { x: 72, y: 50, width: 28, height: 65 },
          feedbackCorrect:
            'Physical server compromise prevented! Server cabinet must be locked with physical keycard logging and IT Infrastructure alerted.',
          feedbackWhyItMatters:
            'Unsecured server racks expose proprietary enterprise databases to direct hardware tampering, physical packet sniffers, and severe airflow disruption.',
          severity: 'critical',
        },
      ],
    },
    {
      id: 'room-meeting',
      name: 'Executive Boardroom A',
      code: 'Zone 202',
      buildingCoordinates: { x: 74, y: 44, label: 'Zone 202 — Conference Room' },
      roomImage: '/assets/facility-inspection/rooms/conference-room.jpg',
      required: true,
      hasIrregularities: true,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: true,
      explanation:
        'An active corporate laptop and a Level-3 VIP security access badge lanyard were left unattended on the conference table after a confidential strategy session.',
      correctFeedback:
        'Correct observation! Unattended active computer equipment and security credentials were left exposed in an unoccupied meeting room.',
      incorrectFeedback:
        'Irregularity missed. Examine the main conference table surface. Confidential electronic assets and credentials have been abandoned.',
      objects: [
        {
          id: 'obj-meeting-laptop',
          label: 'Unattended Corporate Laptop',
          hotspot: { x: 70, y: 66, width: 18, height: 18, label: 'Unattended Laptop' },
          objectType: 'equipment',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['security', 'compliance', 'information-security'],
          incidentType: 'information-security',
          incidentDetails: 'Unattended open laptop displaying proprietary financial metrics and active user session.',
          feedbackCorrect:
            'Information security breach logged! Clean Desk Policy requires locking unattended workstations and securing all physical credential badges.',
          feedbackWhyItMatters:
            'Unattended active laptops allow unauthorized visitors or cleaning staff to view confidential strategy data or clone physical credentials.',
          severity: 'high',
        },
        {
          id: 'obj-meeting-badge',
          label: 'Exposed VIP Security Badge & Lanyard',
          hotspot: { x: 53, y: 77, width: 12, height: 12, label: 'VIP Security Badge' },
          objectType: 'access',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['security', 'compliance', 'physical-security'],
          incidentType: 'physical-security',
          incidentDetails: 'Exposed high-clearance security credential left on meeting table.',
          feedbackCorrect:
            'Physical access credential secured! Badges must be kept on the authorized individual at all times to prevent unauthorized duplication or cloning.',
          feedbackWhyItMatters:
            'Lost or exposed RFID badges can be cloned in seconds by hostile actors or visitors.',
          severity: 'high',
        },
        {
          id: 'obj-meeting-screen',
          label: 'Wall Presentation Display Screen',
          hotspot: { x: 29, y: 28, width: 23, height: 26, label: 'Presentation Display' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The presentation screen is securely mounted on the conference room wall.',
        },
        {
          id: 'obj-meeting-pitcher',
          label: 'Water Pitcher & Glassware',
          hotspot: { x: 44, y: 50, width: 10, height: 12, label: 'Meeting Beverage Service' },
          objectType: 'furniture',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Standard hospitality glassware poses no security hazard.',
        },
        {
          id: 'obj-meeting-chairs',
          label: 'Executive Boardroom Chairs',
          hotspot: { x: 19, y: 72, width: 16, height: 28, label: 'Boardroom Seating' },
          objectType: 'furniture',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Conference seating is neatly arranged and compliant.',
        },
      ],
      irregularities: [
        {
          id: 'irreg-laptop-badge',
          name: 'Unattended Open Laptop & VIP Access Badge',
          description: 'Active corporate laptop and Level-3 security ID lanyard left unattended on the conference table.',
          category: 'security',
          hotspot: { x: 70, y: 66, width: 18, height: 18 },
          feedbackCorrect:
            'Information security breach logged! Clean Desk Policy requires locking unattended workstations and securing all physical credential badges.',
          feedbackWhyItMatters:
            'Unattended active laptops allow unauthorized visitors or cleaning staff to view confidential strategy data or clone physical credentials.',
          severity: 'high',
        },
      ],
    },
    {
      id: 'room-security',
      name: 'Security Operations Center (SOC)',
      code: 'Zone 203',
      buildingCoordinates: { x: 50, y: 38, label: 'Zone 203 — Security Operations' },
      roomImage: '/assets/facility-inspection/rooms/security-operations.jpg',
      required: true,
      hasIrregularities: false,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: false,
      explanation:
        'All systems compliant! Video wall monitors are operational with all green indicators, operator workstations are attended, two-way radios are charging in their dock, and key lockbox is secured.',
      correctFeedback:
        'Correct observation! Security Operations Center is fully compliant with all security and communication standards. No irregularities are present.',
      incorrectFeedback:
        'Inspection error. The Security Operations Center is operating within complete compliance: CCTV wall is functional, radios are docked, and keys are secured. Re-inspect the area.',
      objects: [
        {
          id: 'obj-soc-videowall',
          label: 'CCTV Video Monitor Wall',
          hotspot: { x: 55, y: 25, width: 48, height: 38, label: 'CCTV Surveillance Wall' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'All CCTV cameras are online with green status indicators displaying "SYSTEMS OK".',
        },
        {
          id: 'obj-soc-workstation',
          label: 'Attended Operator Workstation',
          hotspot: { x: 48, y: 65, width: 26, height: 30, label: 'Operator Console' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The console is properly attended by a certified security operator in uniform.',
        },
        {
          id: 'obj-soc-radios',
          label: 'Two-Way Radio Charging Dock',
          hotspot: { x: 74, y: 80, width: 16, height: 18, label: 'Radio Charger Dock' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Two-way radios are fully docked with green charge status lights.',
        },
        {
          id: 'obj-soc-lockbox',
          label: 'Secured Key Lockbox',
          hotspot: { x: 91, y: 72, width: 10, height: 22, label: 'Key Safe Lockbox' },
          objectType: 'access',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The master key cabinet is securely locked with key integrity maintained.',
        },
      ],
      irregularities: [],
    },
    {
      id: 'room-storage',
      name: 'Storage & Logistics Loading Bay',
      code: 'Zone 101',
      buildingCoordinates: { x: 26, y: 72, label: 'Zone 101 — Storage & Logistics' },
      roomImage: '/assets/facility-inspection/rooms/storage-room.jpg',
      required: true,
      hasIrregularities: true,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: true,
      explanation:
        'A slick chemical/liquid puddle has formed across the designated pedestrian safety walkway with no caution cone or barricade deployed.',
      correctFeedback:
        'Correct observation! An unmarked liquid spill across the designated walking route presents a severe slip-and-fall hazard.',
      incorrectFeedback:
        'Irregularity missed. Inspect the warehouse walkway and floor surfaces. Look for slip, trip, or chemical hazards.',
      objects: [
        {
          id: 'obj-storage-spill',
          label: 'Unmarked Liquid Spill on Walkway',
          hotspot: { x: 50, y: 75, width: 32, height: 16, label: 'Liquid Spill Hazard' },
          objectType: 'hazard',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['safety', 'maintenance', 'hazard'],
          incidentType: 'environmental-safety',
          incidentDetails: 'Liquid puddle covering yellow pedestrian safety walkway without wet-floor warning signage.',
          feedbackCorrect:
            'Occupational hazard reported! Standard protocol mandates deploying high-visibility caution cones, cordoning the slip zone, and summoning Facilities Spill Response.',
          feedbackWhyItMatters:
            'Unmarked wet walkways represent the leading cause of industrial workplace injuries and OSHA non-compliance citations.',
          severity: 'medium',
        },
        {
          id: 'obj-storage-shelving',
          label: 'Warehouse Pallet Racks',
          hotspot: { x: 18, y: 45, width: 28, height: 60, label: 'Storage Racking' },
          objectType: 'furniture',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Pallet racking is structurally sound and inventory is stacked within height limits.',
        },
        {
          id: 'obj-storage-palletjack',
          label: 'Manual Pallet Jack',
          hotspot: { x: 57, y: 55, width: 10, height: 12, label: 'Pallet Jack' },
          objectType: 'equipment',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Material handling equipment is in active operation by an authorized warehouse worker.',
        },
        {
          id: 'obj-storage-extinguisher',
          label: 'Column-Mounted Fire Extinguisher',
          hotspot: { x: 82, y: 47, width: 5, height: 10, label: 'Fire Extinguisher' },
          objectType: 'safety',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Fire extinguisher inspection tag is up to date and clearance is maintained.',
        },
      ],
      irregularities: [
        {
          id: 'irreg-chemical-spill',
          name: 'Unmarked Chemical / Liquid Spill on Walkway',
          description: 'Slick liquid pool covering the yellow safety walkway with no wet floor warning cone.',
          category: 'safety',
          hotspot: { x: 50, y: 75, width: 32, height: 16 },
          feedbackCorrect:
            'Occupational hazard reported! Standard protocol mandates deploying high-visibility caution cones, cordoning the slip zone, and summoning Facilities Spill Response.',
          feedbackWhyItMatters:
            'Unmarked wet walkways represent the leading cause of industrial workplace injuries and OSHA non-compliance citations.',
          severity: 'medium',
        },
      ],
    },
    {
      id: 'room-emergency',
      name: 'Emergency Stairwell & Fire Exit Corridor',
      code: 'Zone 103',
      buildingCoordinates: { x: 74, y: 72, label: 'Zone 103 — Fire Corridor' },
      roomImage: '/assets/facility-inspection/rooms/fire-corridor.jpg',
      required: true,
      hasIrregularities: true,
      promptQuestion: 'Are there any irregularities in this room?',
      correctAnswerHasIrregularity: true,
      explanation:
        'Heavy wooden shipping crates and pallets were stacked directly against the emergency egress door and panic push bar, blocking fire egress.',
      correctFeedback:
        'Correct observation! An emergency fire exit door and panic hardware were completely obstructed by stacked shipping materials.',
      incorrectFeedback:
        'Irregularity missed. Life safety egress paths must always be 100% unobstructed. Re-inspect the emergency exit doors.',
      objects: [
        {
          id: 'obj-corridor-crates',
          label: 'Heavy Crates Blocking Fire Exit',
          hotspot: { x: 44, y: 65, width: 28, height: 48, label: 'Obstructing Crates' },
          objectType: 'hazard',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['safety', 'compliance', 'egress'],
          incidentType: 'egress-obstruction',
          incidentDetails: 'Stacked shipping crates blocking the emergency exit door and panic hardware.',
          feedbackCorrect:
            'Critical egress obstruction flagged! Fire safety codes strictly forbid placing any object within 36 inches of an emergency exit.',
          feedbackWhyItMatters:
            'During a fire or active threat evacuation, blocked egress doors cause fatal crush bottlenecks and delay emergency escape.',
          severity: 'critical',
        },
        {
          id: 'obj-corridor-extinguisher',
          label: 'Wall Fire Extinguisher & Sign',
          hotspot: { x: 89, y: 62, width: 10, height: 28, label: 'Fire Extinguisher Station' },
          objectType: 'safety',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'Fire extinguisher is securely mounted and easily accessible.',
        },
        {
          id: 'obj-corridor-exitsign',
          label: 'Illuminated Green EXIT Sign',
          hotspot: { x: 62, y: 8, width: 14, height: 12, label: 'Emergency Exit Sign' },
          objectType: 'safety',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The overhead emergency exit sign is illuminated and visible.',
        },
        {
          id: 'obj-corridor-stairs',
          label: 'Stairwell Walkway & Handrail',
          hotspot: { x: 14, y: 38, width: 18, height: 40, label: 'Stairwell Egress' },
          objectType: 'access',
          isExpectedTarget: false,
          feedbackWhyItMatters: 'The stairway and handrail are clear of debris.',
        },
      ],
      irregularities: [
        {
          id: 'irreg-blocked-door',
          name: 'Obstructed Fire Exit Doorway',
          description: 'Heavy wooden crates stacked directly against the emergency egress push bar.',
          category: 'safety',
          hotspot: { x: 44, y: 65, width: 28, height: 48 },
          feedbackCorrect:
            'Critical egress obstruction flagged! Fire safety codes strictly forbid placing any object within 36 inches of an emergency exit.',
          feedbackWhyItMatters:
            'During a fire or active threat evacuation, blocked egress doors cause fatal crush bottlenecks and delay emergency escape.',
          severity: 'critical',
        },
      ],
    },
  ],
};
