# PageCrafter Books

Create a modern, responsive, and visually clean online bookstore called "PageCrafter".

Target Audience & Aesthetic:

- Clean, editorial design with modern typography (warm neutrals, deep slate, and subtle accent colors like amber or forest green).

- Fast, intuitive browsing experience with high mobile responsiveness.

Core Pages and Components:

1. Header / Navigation:

   - Logo, search bar with live auto-complete styling, category dropdown (Fiction, Non-Fiction, Tech, Academic, Classics), currency switcher, and an interactive sliding Cart Drawer icon with badge counts.

2. Hero Section & Discovery:

   - Featured "Book of the Week" banner with cover preview, ratings, and an instant "Add to Cart" button.

   - Filterable book grid (Filter by: Genre, Price range, Rating, Author, In-stock status; Sort by: Price low-high, Newest, Popularity).

3. Product Card:

   - Book cover thumbnail, title, author, star rating, format badge (Paperback / Hardcover / eBook), price, and an "Add to Cart" button with micro-interactions.

4. Book Detail View (Modal or dedicated page):

   - High-res cover image, sample page reader preview trigger, synopsis, author biography, publication details (ISBN, page count, language), and customer reviews.

5. Checkout & Cart Flow:

   - Cart slide-out showing items, quantity adjusters, subtotal, shipping estimation, and promo code field.

   - 3-step checkout page: Shipping address form, Payment method selector (Stripe / Cash on Delivery mock), and Order Review.

Technical Requirements:

- Use Tailwind CSS and Lucide icons.

- Store client-side state using React context/Zustand for cart management.

- Prepare modular API service functions (e.g., `api/books.ts`, `api/orders.ts`) configured with a base URL variable (`NEXT_PUBLIC_API_URL` or `VITE_BACKEND_URL`) so it can connect seamlessly to a REST backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0e1dcd03-9750-4c96-be7a-11db3590f71c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
