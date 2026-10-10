// Airport + terminal constants for Hartsfield-Jackson Atlanta International Airport (ATL)

export type TerminalType = 'domestic' | 'international';

export const AIRPORT_NAME = 'Hartsfield-Jackson Atlanta International Airport';

export const AIRPORT_TERMINALS: Record<TerminalType, { label: string; shortLabel: string; address: string }> = {
  domestic: {
    label: 'Domestic Terminal',
    shortLabel: 'Domestic',
    address: 'Hartsfield-Jackson Atlanta International Airport, Domestic Terminal, Atlanta, GA 30320',
  },
  international: {
    label: 'International Terminal (Maynard H. Jackson Jr.)',
    shortLabel: 'International',
    address: 'Maynard H. Jackson Jr. International Terminal, Atlanta, GA 30320',
  },
};
