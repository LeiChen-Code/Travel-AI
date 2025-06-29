/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chatAI from "../chatAI.js";
import type * as files from "../files.js";
import type * as generateImage from "../generateImage.js";
import type * as http from "../http.js";
import type * as initChat from "../initChat.js";
import type * as messages from "../messages.js";
import type * as openai from "../openai.js";
import type * as retrier from "../retrier.js";
import type * as travelplan from "../travelplan.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chatAI: typeof chatAI;
  files: typeof files;
  generateImage: typeof generateImage;
  http: typeof http;
  initChat: typeof initChat;
  messages: typeof messages;
  openai: typeof openai;
  retrier: typeof retrier;
  travelplan: typeof travelplan;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
