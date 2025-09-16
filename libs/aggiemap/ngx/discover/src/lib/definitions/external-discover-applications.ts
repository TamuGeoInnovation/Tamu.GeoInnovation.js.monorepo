import { ExternalDiscoverApplication } from '../interfaces/discover-application.interface';

export const ExternalDiscoverApplications: ExternalDiscoverApplication[] = [
  // 3D Applications
  {
    id: 'architecture-master-plan-buildings',
    name: 'Architecture Master Plan Buildings',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/3d/arch-angular',
    keywords: ['3d']
  },
  {
    id: 'dominic-3d-sketchup-buildings',
    name: 'Dominic 3D Sketchup Buildings',
    description: 'More detailed master plan buildings. Adds missing buildings from master plan.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/3d/dom',
    keywords: ['3d']
  },
  {
    id: 'laah-3d',
    name: 'LAAH 3D',
    description:
      'Floors, rooms, elevators, stairs, light poles, night mode, true time shadows. Requires toggling individual features in hamburger menu.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/3d/evans',
    keywords: ['3d']
  },
  {
    id: 'low-fidelity-3d-campus-unity',
    name: 'Low fidelity 3D campus in Unity',
    description:
      'Basic building box meshes. On application start, hit ESC key to exit menu and then pan camera with mouse and move around with WASD keys.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/3d/game/full',
    keywords: ['3d', 'unity']
  },
  {
    id: 'high-fidelity-laah-building-unity',
    name: 'High fidelity LAAH building in Unity',
    description:
      'Highly detailed building interior spaces. On application start, hit ESC key to exit menu and then pan camera with mouse and move around with WASD keys.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/3d/game/full',
    keywords: ['3d', 'unity']
  },
  {
    id: 'csfd-firefighter-demo-hullaballoo',
    name: 'CSFD Firefighter Demo for Hullaballoo',
    description:
      'Plays back a call recording with CSFD and goes through the call transcript automatically animating the scenario.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/csfd',
    keywords: ['3d']
  },
  {
    id: 'high-fidelity-3d-evans-exterior',
    name: 'High Fidelity 3D Evans Exterior',
    description: 'Different color meshes with detailed exterior features.',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/evans',
    keywords: ['3d']
  },
  // 2D Applications
  {
    id: 'graduation-arrival',
    name: 'Graduation Arrival',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/graduation/arrival',
    keywords: ['2d']
  },
  {
    id: 'graduation-departure',
    name: 'Graduation Departure',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/graduation/departure',
    keywords: ['2d']
  },
  {
    id: 'hailstorm',
    name: 'Hailstorm',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/hailstorm',
    keywords: ['2d']
  },
  {
    id: 'movein',
    name: 'Movein',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/movein',
    keywords: ['2d']
  },
  {
    id: 'signage',
    name: 'Signage',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/Signage',
    keywords: ['2d']
  },
  {
    id: 'trees',
    name: 'Trees',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/trees',
    keywords: ['2d']
  },
  {
    id: 'vector',
    name: 'Vector',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/vector',
    keywords: ['2d']
  },
  {
    id: 'dining',
    name: 'Dining',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/dining',
    keywords: ['2d']
  },
  // Events
  {
    id: 'aggieland-saturday',
    name: 'Aggieland Saturday',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/aggieland-saturday',
    keywords: ['event']
  },
  {
    id: 'big-event',
    name: 'Big Event',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/big-event',
    keywords: ['event']
  },
  {
    id: 'physics-engineering-festival',
    name: 'Physics and Engineering Festival',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/phys-eng-festival',
    keywords: ['event']
  },
  {
    id: 'family-weekend',
    name: 'Family Weekend',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/family-weekend',
    keywords: ['event']
  },
  {
    id: 'maroon-white-game',
    name: 'Maroon & White Game',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/maroon-white-game',
    keywords: ['event']
  },
  {
    id: 'muster',
    name: 'Muster',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/muster',
    keywords: ['event']
  },
  {
    id: 'bike-ms-150',
    name: 'Bike MS 150',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/ms150',
    keywords: ['event']
  },
  {
    id: 'ring-day',
    name: 'Ring Day',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/ringday',
    keywords: ['event']
  },
  {
    id: 'showdown-rivalry',
    name: 'Showdown Rivalry',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://aggiemap.tamu.edu/showdown-rivalry',
    keywords: ['event']
  },
  {
    id: 'troubadour-festival',
    name: 'Troubadour Festival',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/troubadour-festival',
    keywords: ['event']
  },
  {
    id: '4h-roundup',
    name: '4-H Roundup',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/4h-roundup',
    keywords: ['event']
  },
  {
    id: 'tamu-graduation',
    name: 'TAMU Graduation',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/graduation',
    keywords: ['event']
  },
  {
    id: 'high-school-graduation',
    name: 'High School Graduation',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/hs-graduation/',
    keywords: ['event']
  }
];
