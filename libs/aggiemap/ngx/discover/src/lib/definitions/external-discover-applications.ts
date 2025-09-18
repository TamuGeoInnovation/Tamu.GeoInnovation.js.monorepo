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
    id: 'hailstorm',
    name: 'Hailstorm',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/hailstorm',
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
    id: 'ring-day',
    name: 'Ring Day',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/ringday',
    keywords: ['event'],
    labels: ['deprecated']
  },
  {
    id: 'showdown-rivalry',
    name: 'Showdown Rivalry',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://aggiemap.tamu.edu/showdown-rivalry',
    keywords: ['event'],
    labels: ['deprecated']
  },
  {
    id: 'movein',
    name: 'Movein',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/movein',
    keywords: ['2d'],
    labels: ['deprecated']
  },
  {
    id: 'graduation-arrival',
    name: 'Graduation Arrival',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/graduation/arrival',
    keywords: ['2d'],
    labels: ['deprecated']
  },
  {
    id: 'graduation-departure',
    name: 'Graduation Departure',
    description: '',
    source: 'external',
    type: 'experiment',
    location: 'https://dev.aggiemap.tamu.edu/graduation/departure',
    keywords: ['2d'],
    labels: ['deprecated']
  }
];
