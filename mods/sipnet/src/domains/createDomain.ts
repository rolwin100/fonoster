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
import { GRPCErrors, handleError } from "@fonoster/common";
import { getLogger } from "@fonoster/logger";
import { z } from "zod";
import { DomainsAPI } from "./types";

const logger = getLogger({ service: "identity", filePath: __filename });

const CreateDomainRequestSchema = z.object({
  name: z.string().min(3, "Name must contain at least 3 characters").max(50),
  domainUri: z
    .string()
    .min(3, "Domain URI must contain at least 3 characters")
    .max(50)
});

type CreateDomainRequest = z.infer<typeof CreateDomainRequestSchema>;

type CreateDomainResponse = {
  id: string;
};

function createDomain(domains: DomainsAPI) {
  return async (
    call: { request: CreateDomainRequest },
    callback: (error: GRPCErrors, response?: CreateDomainResponse) => void
  ) => {
    try {
      const validatedRequest = CreateDomainRequestSchema.parse(call.request);

      const { name, domainUri } = validatedRequest;

      logger.verbose("call to createDomain", { name, domainUri });

      const response = await domains.createDomain({
        name,
        domainUri
      });

      callback(null, {
        id: response.ref
      });
    } catch (error) {
      handleError(error, callback);
    }
  };
}

export { createDomain };
