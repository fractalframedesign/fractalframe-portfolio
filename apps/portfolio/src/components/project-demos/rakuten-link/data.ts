/** Made-up people and numbers only. Nothing here comes from a real phone. */

export type Contact = {
  id: string;
  name: string;
  phone: string;
  /** Uses Rakuten Link, so calls and messages are free */
  onLink: boolean;
  favorite?: boolean;
};

export type Message =
  | {
      id: string;
      from: 'me' | 'them';
      kind: 'text';
      text: string;
      time: string;
      seen?: boolean;
    }
  | {
      id: string;
      from: 'me' | 'them';
      kind: 'location';
      place: string;
      time: string;
      seen?: boolean;
    }
  | {
      id: string;
      from: 'me' | 'them';
      kind: 'voice';
      seconds: number;
      time: string;
      seen?: boolean;
    };

export type DayBlock = { date: string; messages: Message[] };

export type Conversation = {
  contactId: string;
  days: DayBlock[];
  unread?: number;
};

export const CONTACTS: Contact[] = [
  {
    id: 'aiko',
    name: 'Aiko Tanaka',
    phone: '070-1234-5601',
    onLink: true,
    favorite: true,
  },
  {
    id: 'ben',
    name: 'Ben Ito',
    phone: '070-1234-5602',
    onLink: true,
    favorite: true,
  },
  {
    id: 'chika',
    name: 'Chika Mori',
    phone: '080-2345-6703',
    onLink: false,
    favorite: true,
  },
  { id: 'daniel', name: 'Daniel Park', phone: '070-1234-5604', onLink: true },
  { id: 'emi', name: 'Emi Sato', phone: '090-3456-7805', onLink: false },
  {
    id: 'farah',
    name: 'Farah Khan',
    phone: '070-1234-5606',
    onLink: true,
    favorite: true,
  },
  { id: 'hiro', name: 'Hiro Nakamura', phone: '070-1234-5607', onLink: true },
  {
    id: 'kenji',
    name: 'Kenji Watanabe',
    phone: '080-2345-6708',
    onLink: false,
  },
  { id: 'lena', name: 'Lena Fischer', phone: '070-1234-5609', onLink: true },
  { id: 'maya', name: 'Maya Rao', phone: '070-1234-5610', onLink: true },
  { id: 'noah', name: 'Noah Kim', phone: '090-3456-7811', onLink: false },
  { id: 'rina', name: 'Rina Suzuki', phone: '070-1234-5612', onLink: true },
  { id: 'sam', name: 'Sam Lee', phone: '070-1234-5613', onLink: true },
  { id: 'yuki', name: 'Yuki Ono', phone: '080-2345-6714', onLink: false },
];

export const GROUPS = [
  { name: 'Family', count: 4 },
  { name: 'Team', count: 6 },
  { name: 'Running club', count: 3 },
];

export const CONVERSATIONS: Conversation[] = [
  {
    contactId: 'aiko',
    unread: 2,
    days: [
      {
        date: 'Mon, Nov 3',
        messages: [
          {
            id: 'a1',
            from: 'me',
            kind: 'text',
            text: '👋 Hi',
            time: '09:04 AM',
            seen: true,
          },
          {
            id: 'a2',
            from: 'them',
            kind: 'text',
            text: 'Hi! How are you?',
            time: '09:05 AM',
          },
        ],
      },
      {
        date: 'Wed, Nov 5',
        messages: [
          {
            id: 'a3',
            from: 'them',
            kind: 'location',
            place: 'Shibuya Station, Tokyo',
            time: '06:24 PM',
          },
          {
            id: 'a4',
            from: 'them',
            kind: 'text',
            text: 'Meet here at 7? The east exit is quieter.',
            time: '06:27 PM',
          },
          {
            id: 'a5',
            from: 'me',
            kind: 'text',
            text: 'Perfect, see you there.',
            time: '06:28 PM',
            seen: true,
          },
        ],
      },
      {
        date: 'Today',
        messages: [
          {
            id: 'a6',
            from: 'them',
            kind: 'voice',
            seconds: 12,
            time: '10:41 AM',
          },
          {
            id: 'a7',
            from: 'them',
            kind: 'text',
            text: 'Call me when you are free?',
            time: '10:42 AM',
          },
        ],
      },
    ],
  },
  {
    contactId: 'farah',
    days: [
      {
        date: 'Yesterday',
        messages: [
          {
            id: 'f1',
            from: 'them',
            kind: 'text',
            text: 'Thanks for the call earlier, the line was so clear.',
            time: '08:12 PM',
          },
          {
            id: 'f2',
            from: 'me',
            kind: 'text',
            text: 'Free calls on Link, can’t beat it 😄',
            time: '08:14 PM',
            seen: true,
          },
        ],
      },
    ],
  },
  {
    contactId: 'chika',
    days: [
      {
        date: 'Oct 27',
        messages: [
          {
            id: 'c1',
            from: 'them',
            kind: 'text',
            text: 'Hi',
            time: '04:49 PM',
          },
        ],
      },
    ],
  },
];

export const contactById = (id: string): Contact => {
  const contact = CONTACTS.find((c) => c.id === id);
  if (!contact) throw new Error(`Unknown demo contact: ${id}`);
  return contact;
};

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
