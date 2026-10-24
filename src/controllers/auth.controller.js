import { asyncHandler } from '../utils/asyncHandler.js';

export function createAuthController({ authService }) {
  return {
    register: asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);
      res.status(201).json({ data: result });
    }),

    login: asyncHandler(async (req, res) => {
      const result = await authService.login(req.body);
      res.json({ data: result });
    }),

    me: asyncHandler((req, res) => {
      res.json({ data: authService.getProfile(req.user.id) });
    }),
  };
}
