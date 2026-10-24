/** Meneruskan error dari handler async/sync ke middleware error Express. */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve()
    .then(() => handler(req, res, next))
    .catch(next);
};
