import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  ...props,
});

export const IconLuggage = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12H3zM8 7V4h8v3M8 19v2M16 19v2" />
  </svg>
);

export const IconSeat = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10V6a2 2 0 012-2h2v8H7a2 2 0 01-2-2zM9 12v4l-2 4M9 12h6a2 2 0 012 2v6l-2 4M15 12V4a2 2 0 00-2-2" />
  </svg>
);

export const IconScreen = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 16v4" />
  </svg>
);

export const IconLocation = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconClock = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

export const IconCard = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path strokeLinecap="round" d="M3 10h18" />
  </svg>
);

export const IconCar = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 16l-1.5-4a2 2 0 011.9-2.7h13.2a2 2 0 011.9 2.7L19 16M5 16h14M5 16v3M19 16v3M7.5 13h9" />
    <circle cx="8" cy="16.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPlane = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16v-2l-8-5V4a1.5 1.5 0 00-3 0v5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5l-2-1.5v-5.5z" />
  </svg>
);

export const IconArrow = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const IconChevronDown = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export const IconPhone = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 3.5l2 2-2 2 1 3 4 4 3 1 2-2 2 2-3 3c-5 0-12-7-12-12l3-3z" />
  </svg>
);

export const IconMail = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
  </svg>
);

export const IconBolt = (props: IconProps) => (
  <svg {...base(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

export const IconCybertruck = (props: IconProps) => (
  <svg {...base(props)} viewBox="0 0 28 24">
    {/* Cybertruck side silhouette */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h24M3 18l1.5-3h6L9 7l9-3 6 8v6M26 18l-1.5-3" />
    {/* Windshield line */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 4l-3 8h6" />
    {/* Wheels */}
    <circle cx="7" cy="19" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="21" cy="19" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);
