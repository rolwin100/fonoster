/*
 * Copyright (C) 2024 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/fonoster
 *
 * This file is part of Fonoster
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MappingTuple } from "./types";
import { getEnumKey, isMapping } from "./utils";

function objectToJson<J extends Record<string, unknown>>(
  obj: new () => unknown,
  enumMapping?: MappingTuple<unknown>,
  repeatableObjectMapping?: MappingTuple<unknown>
): J {
  const json: Record<string, unknown> = {};

  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((key) => {
    if (
      key.startsWith("get") &&
      typeof obj[key] === "function" &&
      key !== "getPrototypeOf"
    ) {
      const propName = key.charAt(3).toLowerCase() + key.slice(4);
      try {
        const value = obj[key]();

        if (value === null || value === undefined || value === "") {
          return;
        }

        if (isMapping(propName, enumMapping)) {
          json[propName] = getEnumKey(propName, value as number, enumMapping);
        } else if (isMapping(propName, repeatableObjectMapping)) {
          // Remove the "List" ending from the key
          const repeatableKey = propName.slice(0, -4);

          json[repeatableKey] = (value as unknown[]).map((item) =>
            objectToJson(
              item as new () => unknown,
              enumMapping,
              repeatableObjectMapping
            )
          );
        } else if (value !== undefined) {
          json[propName] = value;
        }
      } catch (error) {
        // Ignore
      }
    }
  });

  return json as J;
}

export { objectToJson };
