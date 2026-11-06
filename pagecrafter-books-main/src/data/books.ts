export type Format = "Paperback" | "Hardcover" | "eBook";
export const CATEGORIES = ["Fiction", "Non-Fiction", "Tech", "Academic", "Classics", "Love Stories", "CSE", "CSE AI/ML", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Comics"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  authorBio: string;
  category: Category;
  format: Format;
  price: number; // USD
  rating: number;
  ratingCount: number;
  popularity: number;
  publishedAt: string;
  inStock: boolean;
  isbn: string;
  pages: number;
  language: string;
  publisher: string;
  synopsis: string;
  sample: string;
  cover: { from: string; to: string; ink: string };
  reviews: Review[];
}

const r = (name: string, rating: number, text: string, date: string): Review => ({ name, rating, text, date });

const covers = [
  { from: "oklch(0.35 0.06 155)", to: "oklch(0.22 0.04 160)", ink: "oklch(0.92 0.06 85)" },
  { from: "oklch(0.72 0.14 65)", to: "oklch(0.55 0.15 45)", ink: "oklch(0.2 0.03 250)" },
  { from: "oklch(0.3 0.03 250)", to: "oklch(0.18 0.02 250)", ink: "oklch(0.8 0.14 75)" },
  { from: "oklch(0.88 0.03 85)", to: "oklch(0.78 0.05 80)", ink: "oklch(0.25 0.03 250)" },
  { from: "oklch(0.45 0.12 25)", to: "oklch(0.3 0.09 20)", ink: "oklch(0.95 0.02 85)" },
  { from: "oklch(0.5 0.08 230)", to: "oklch(0.32 0.06 240)", ink: "oklch(0.95 0.02 85)" },
];

const base: Omit<Book, "cover" | "reviews" | "authorBio" | "sample" | "publisher" | "language">[] = [
  { id: "signal-and-silence", title: "Signal & Silence", author: "Dev Raman", category: "Tech", format: "Paperback", price: 39.5, rating: 4.5, ratingCount: 612, popularity: 81, publishedAt: "2026-06-03", inStock: true, isbn: "978-0-13-468599-1", pages: 452, synopsis: "A practical, beautifully argued field guide to building calm software systems — observability, backpressure and the art of doing less." },
  { id: "salt-roads", title: "Salt Roads", author: "Amara Okafor", category: "Non-Fiction", format: "Hardcover", price: 32.0, rating: 4.8, ratingCount: 2231, popularity: 95, publishedAt: "2025-11-18", inStock: true, isbn: "978-0-525-55360-5", pages: 336, synopsis: "A sweeping history of the trade routes that seasoned civilizations, told through the merchants, sailors and cooks who carried salt across continents." },
  { id: "pride-and-prejudice", title: "Pride and Prejudice", author: "Jane Austen", category: "Classics", format: "Paperback", price: 9.99, rating: 4.6, ratingCount: 9812, popularity: 90, publishedAt: "1813-01-28", inStock: true, isbn: "978-0-14-143951-8", pages: 432, synopsis: "Elizabeth Bennet's wit meets Mr. Darcy's pride in Austen's sparkling comedy of manners, first impressions and second chances." },
  { id: "linear-thinking", title: "Linear Thinking", author: "Prof. Hana Sato", category: "Academic", format: "Hardcover", price: 74.0, rating: 4.3, ratingCount: 288, popularity: 52, publishedAt: "2024-08-01", inStock: false, isbn: "978-1-108-47071-2", pages: 612, synopsis: "A rigorous yet approachable introduction to linear algebra with applications in data science, physics and economics." },
  { id: "ember-tide", title: "Ember Tide", author: "Lucas Varga", category: "Fiction", format: "eBook", price: 12.99, rating: 4.2, ratingCount: 744, popularity: 70, publishedAt: "2026-03-22", inStock: true, isbn: "978-1-250-81432-0", pages: 298, synopsis: "A lighthouse keeper's daughter discovers the sea is burning from below in this taut, atmospheric thriller." },
  { id: "the-small-habit", title: "The Small Habit", author: "Nora Whitfield", category: "Non-Fiction", format: "Paperback", price: 18.0, rating: 4.4, ratingCount: 3120, popularity: 88, publishedAt: "2025-02-14", inStock: true, isbn: "978-0-7352-1129-2", pages: 256, synopsis: "Why tiny, repeated actions shape our lives more than grand resolutions — and how to design days you actually enjoy." },
  { id: "rust-in-practice", title: "Rust in Practice", author: "Ingrid Holm", category: "Tech", format: "eBook", price: 29.0, rating: 4.9, ratingCount: 1004, popularity: 84, publishedAt: "2026-07-30", inStock: true, isbn: "978-1-7185-0310-6", pages: 520, synopsis: "From ownership to async runtimes: production patterns for writing fast, fearless Rust." },
  { id: "moby-dick", title: "Moby-Dick", author: "Herman Melville", category: "Classics", format: "Hardcover", price: 22.5, rating: 4.1, ratingCount: 5402, popularity: 66, publishedAt: "1851-10-18", inStock: true, isbn: "978-0-14-243724-7", pages: 720, synopsis: "Captain Ahab's obsessive hunt for the white whale — an epic of the sea, of madness and of the limits of human will." },
  { id: "cognition-a-primer", title: "Cognition: A Primer", author: "Dr. Elena Marsh", category: "Academic", format: "Paperback", price: 48.0, rating: 4.0, ratingCount: 190, popularity: 40, publishedAt: "2025-09-09", inStock: true, isbn: "978-0-19-882472-1", pages: 408, synopsis: "A clear survey of how we perceive, remember and decide, built around landmark experiments in cognitive science." },
  { id: "northern-lights-cafe", title: "Northern Lights Café", author: "Sofie Lund", category: "Fiction", format: "Paperback", price: 16.99, rating: 4.5, ratingCount: 1530, popularity: 79, publishedAt: "2026-10-01", inStock: true, isbn: "978-0-06-308712-4", pages: 342, synopsis: "A cozy, bittersweet story of a café at the edge of the Arctic and the strangers who find their way there each winter." },
  { id: "design-of-cities", title: "The Design of Cities", author: "Marco Bellini", category: "Non-Fiction", format: "Hardcover", price: 44.0, rating: 4.6, ratingCount: 402, popularity: 58, publishedAt: "2024-04-17", inStock: false, isbn: "978-0-14-004236-4", pages: 368, synopsis: "How streets, squares and skylines shape the way we live — a richly illustrated tour of urban design through the ages." },
  { id: "letters-in-the-rain", title: "Letters in the Rain", author: "Ananya Mehra", category: "Love Stories", format: "Paperback", price: 14.99, rating: 4.6, ratingCount: 326, popularity: 87, publishedAt: "2026-05-12", inStock: true, isbn: "", pages: 288, synopsis: "Two childhood friends reconnect through letters during a monsoon, discovering that the words left unsaid may hold their second chance at love." },
  { id: "a-place-for-us", title: "A Place for Us", author: "Rohan Kapoor", category: "Love Stories", format: "Paperback", price: 15.99, rating: 4.5, ratingCount: 214, popularity: 83, publishedAt: "2026-02-14", inStock: true, isbn: "", pages: 312, synopsis: "An architect and a musician meet on a train and build an unlikely friendship that becomes a tender story of distance, dreams and finding home." },
  { id: "cse-data-structures", title: "Data Structures & Algorithms", author: "Dr. Arjun Rao", category: "CSE", format: "Paperback", price: 34.99, rating: 4.7, ratingCount: 408, popularity: 89, publishedAt: "2026-01-10", inStock: true, isbn: "", pages: 480, synopsis: "A student-focused introduction to arrays, linked lists, trees, graphs and algorithm analysis, with worked examples and programming exercises." },
  { id: "cse-computer-science-foundations", title: "Computer Science Foundations", author: "Prof. Kavita Shah", category: "CSE", format: "Paperback", price: 32.99, rating: 4.5, ratingCount: 267, popularity: 82, publishedAt: "2025-07-15", inStock: true, isbn: "", pages: 536, synopsis: "Core CSE subjects in one volume: computer architecture, operating systems, databases, networks and software engineering, with chapter-end practice questions." },
  { id: "aiml-artificial-intelligence", title: "Artificial Intelligence: A Student Guide", author: "Dr. Neha Iyer", category: "CSE AI/ML", format: "Paperback", price: 38.99, rating: 4.6, ratingCount: 295, popularity: 86, publishedAt: "2026-04-20", inStock: true, isbn: "", pages: 424, synopsis: "Explore search algorithms, knowledge representation, reasoning and intelligent agents through approachable explanations and practical projects for AI/ML students." },
  { id: "aiml-machine-learning-python", title: "Machine Learning with Python", author: "Vikram Desai", category: "CSE AI/ML", format: "Paperback", price: 36.99, rating: 4.8, ratingCount: 512, popularity: 92, publishedAt: "2026-06-18", inStock: true, isbn: "", pages: 456, synopsis: "Build a foundation in regression, classification, clustering and neural networks using Python, with datasets, model evaluation and hands-on exercises." },
  { id: "class-6-maths-science", title: "Class 6: Mathematics & Science", author: "PageCrafter Learning", category: "Class 6", format: "Paperback", price: 11.99, rating: 4.4, ratingCount: 126, popularity: 76, publishedAt: "2026-03-01", inStock: true, isbn: "", pages: 240, synopsis: "A Class 6 practice companion covering numbers, fractions, geometry, living things and everyday science, with worked examples and revision exercises." },
  { id: "class-7-maths-science", title: "Class 7: Mathematics & Science", author: "PageCrafter Learning", category: "Class 7", format: "Paperback", price: 12.99, rating: 4.5, ratingCount: 142, popularity: 77, publishedAt: "2026-03-01", inStock: true, isbn: "", pages: 264, synopsis: "Strengthen Class 7 concepts in integers, algebra, triangles, heat, nutrition and motion through clear explanations and topic-based practice." },
  { id: "class-8-maths-science", title: "Class 8: Mathematics & Science", author: "PageCrafter Learning", category: "Class 8", format: "Paperback", price: 13.99, rating: 4.5, ratingCount: 158, popularity: 78, publishedAt: "2026-03-01", inStock: true, isbn: "", pages: 288, synopsis: "Class 8 revision and practice in equations, mensuration, data handling, cells, force and light, with self-assessment questions." },
  { id: "class-9-maths-science", title: "Class 9: Mathematics & Science", author: "PageCrafter Learning", category: "Class 9", format: "Paperback", price: 15.99, rating: 4.6, ratingCount: 183, popularity: 80, publishedAt: "2026-03-01", inStock: true, isbn: "", pages: 352, synopsis: "A Class 9 study companion for number systems, polynomials, geometry, matter, tissues and gravitation, including worked solutions and revision sets." },
  { id: "class-10-maths-science", title: "Class 10: Mathematics & Science", author: "PageCrafter Learning", category: "Class 10", format: "Paperback", price: 17.99, rating: 4.7, ratingCount: 246, popularity: 85, publishedAt: "2026-03-01", inStock: true, isbn: "", pages: 408, synopsis: "Prepare with Class 10 exercises in quadratic equations, trigonometry, chemical reactions, electricity and life processes, plus practice papers." },
  { id: "comics-cosmic-cadet", title: "Cosmic Cadet: First Flight", author: "Tara Sen", category: "Comics", format: "Paperback", price: 10.99, rating: 4.7, ratingCount: 203, popularity: 84, publishedAt: "2026-08-05", inStock: true, isbn: "", pages: 128, synopsis: "A young space cadet and a mischievous robot race to save their school spaceship in a colorful comic adventure about courage and friendship." },
  { id: "comics-mystery-club", title: "The Midnight Mystery Club", author: "Kabir Das", category: "Comics", format: "Paperback", price: 9.99, rating: 4.5, ratingCount: 174, popularity: 81, publishedAt: "2026-07-10", inStock: true, isbn: "", pages: 112, synopsis: "Three friends follow a trail of strange clues through their neighborhood in a funny, fast-paced comic full of puzzles and unexpected discoveries." },
];

export const BOOKS: Book[] = base.map((b, i) => ({
  ...b,
  cover: covers[i % covers.length] ?? covers[0] ?? { from: "", to: "", ink: "" },
  language: "English",
  publisher: ["Hollow Press", "Northbound Books", "Lantern & Co."][i % 3] ?? "Hollow Press",
  authorBio: `${b.author} is an award-winning writer whose work has been translated into more than a dozen languages. They live between the city and the coast, and are currently at work on their next book.`,
  sample: `${b.synopsis}\n\nChapter One\n\nThe morning arrived the way it always did here — slowly, as if asking permission. Light pooled at the edges of things before it dared to cross the floor. I remember thinking that if I stayed very still, the day might forget about me entirely.\n\nIt did not. Days rarely do.`,
  reviews: [
    r("Priya S.", 5, "Couldn't put it down. Beautifully written and paced.", "2026-10-02"),
    r("Tom W.", 4, "Thoughtful and rich — a few slow chapters, but worth it.", "2026-09-14"),
    r("Ana L.", 5, "Already bought a second copy for a friend.", "2026-08-21"),
  ],
}));

export const BOOK_OF_THE_WEEK_ID = "signal-and-silence";
