import { codes } from "../utils/codes";
import * as handler from "../handlers/console";
import express, { Request, Response } from "express";

const router = express.Router({ caseSensitive: true, strict: true });

// Routes
router.route("/apihub/endpoints").get(handler.endpoints);
router.route("/apihub/endpoints/:id").get(handler.endpoint);
router.route("/apihub/endpoint-title-exists").post(handler.endpointTitleExists);
router.route("/apihub/compose-endpoint").post(handler.composeEndpoint);
router.route("/apihub/save-endpoint").post(handler.saveEndpoints);
router.route("/apihub/toggle-endpoint-visibility").post(handler.toggleEndpointVisibility);
router.route("/apihub/delete-endpoint").post(handler.deleteEndpoint);

router.route("/logs/daily-statistics").get(handler.dailyStatistics);
router.route("/logs/all-requests").get(handler.allRequests);
router.route("/logs/failed-requests").get(handler.failedRequests);

// ? fallback route
router.route("/*").get((req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: new Date().toDateString(), data: codes["Invalid Console Route"] });
});

export default router;
