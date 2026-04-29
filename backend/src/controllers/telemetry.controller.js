const {
  ingestTelemetry,
  getLatestByGroup,
  getRecentByGroup,
} = require("../services/telemetry.service");

const ingest = async (req, res, next) => {
  try {
    const result = await ingestTelemetry(req.body);
    res.status(result.deduplicated ? 200 : 201).json({
      success: true,
      message: result.deduplicated ? "Evento duplicado ignorado" : "Telemetria registrada",
      deduplicated: result.deduplicated,
      data: result.item,
    });
  } catch (error) {
    next(error);
  }
};

const latest = async (_req, res, next) => {
  try {
    const data = await getLatestByGroup();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const recentByGroup = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await getRecentByGroup(req.params.grupoRubroId, limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { ingest, latest, recentByGroup };
