import { registerHooks } from "node:module";

let installed = false;

export function installStripTypesResolutionHooks() {
  if (installed) return;

  registerHooks({
    resolve(specifier, context, nextResolve) {
      try {
        return nextResolve(specifier, context);
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ERR_MODULE_NOT_FOUND" &&
          (specifier.startsWith("./") || specifier.startsWith("../")) &&
          !/\.[a-z0-9]+$/i.test(specifier)
        ) {
          for (const extension of [".ts", ".tsx", ".js", ".jsx"]) {
            try {
              return nextResolve(`${specifier}${extension}`, context);
            } catch (candidateError) {
              if (
                candidateError instanceof Error &&
                "code" in candidateError &&
                candidateError.code === "ERR_MODULE_NOT_FOUND"
              ) {
                continue;
              }

              throw candidateError;
            }
          }
        }

        throw error;
      }
    },
  });

  installed = true;
}
