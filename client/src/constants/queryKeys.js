export const queryKeys = {
  books: {
    all: ["books"],
    lists: () => [...queryKeys.books.all, "list"],
    list: (filters) => [...queryKeys.books.lists(), filters],
    details: () => [...queryKeys.books.all, "detail"],
    detail: (id) => [...queryKeys.books.details(), id],
  },
  cart: {
    all: ["cart"],
  },
  wishlist: {
    all: ["wishlist"],
  },
  orders: {
    all: ["orders"],
    detail: (id) => [...queryKeys.orders.all, id],
  },
  user: {
    profile: ["profile"],
    stats: ["userStats"],
  },
  support: {
    tickets: ["tickets"],
    ticketMessages: (id) => ["tickets", id, "messages"],
  },
};
