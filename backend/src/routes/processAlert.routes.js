const { Router } = require("express");
const { query } = require("express-validator");
const { list, count, markOneRead, markAll } = require("../controllers/processAlert.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  [
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("unreadOnly").optional().isIn(["true", "false", "1", "0"]),
    validateRequest,
  ],
  list
);

router.get("/count", count);
router.patch("/:id/read", markOneRead);
router.post("/mark-all-read", markAll);

module.exports = router;
