// functions/src/index.ts

/**
 * Import function triggers from their respective submodules:
 *
 * import { onCall } from "firebase-functions/v2/https";
 * import { onDocumentWritten } from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at:
 * https://firebase.google.com/docs/functions
 */

import { summarizeChat } from "./summarizeChat";

// Export all deployed functions
export { summarizeChat };
