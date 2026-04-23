export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'admin' | 'regular';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  description?: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
  pages?: number;
  language?: string;
  coverImage?: string;
  isAvailable: boolean;
  hasPdf: boolean;
  pdfUrl?: string;
  pdfDownloadUrl?: string;
}

export interface BookLoan {
  id: string;
  user: User;
  book: Book;
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  daysUntilDue: number;
  isOverdue: boolean;
}
