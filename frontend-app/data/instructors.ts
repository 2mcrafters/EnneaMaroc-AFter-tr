export interface Instructor {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

export const instructors: Instructor[] = [
  { id: 'evelyn-reed', name: 'Dr. Evelyn Reed', imageUrl: 'https://i.pravatar.cc/150?u=evelyn', email: 'evelyn.reed@example.com' },
  { id: 'samuel-chen', name: 'Prof. Samuel Chen', imageUrl: 'https://i.pravatar.cc/150?u=samuel', email: 'samuel.chen@example.com' },
  { id: 'aisha-khan', name: 'Dr. Aisha Khan', imageUrl: 'https://i.pravatar.cc/150?u=aisha', email: 'aisha.khan@example.com' },
  { id: 'leo-martinez', name: 'Leo Martinez', imageUrl: 'https://i.pravatar.cc/150?u=leo', email: 'leo.martinez@example.com' },
  { id: 'sophia-nguyen', name: 'Sophia Nguyen', imageUrl: 'https://i.pravatar.cc/150?u=sophia', email: 'sophia.nguyen@example.com' },
  { id: 'david-carter', name: 'David Carter', imageUrl: 'https://i.pravatar.cc/150?u=david', email: 'david.carter@example.com' },
  { id: 'alan-turing', name: 'Prof. Alan Turing', imageUrl: 'https://i.pravatar.cc/150?u=alan', email: 'alan.turing@example.com' },
  { id: 'marie-curie', name: 'Dr. Marie Curie', imageUrl: 'https://i.pravatar.cc/150?u=marie', email: 'marie.curie@example.com' },
  { id: 'isaac-newton', name: 'Dr. Isaac Newton', imageUrl: 'https://i.pravatar.cc/150?u=isaac', email: 'isaac.newton@example.com' },
];