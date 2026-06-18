import * as React from "react";
import { useRouter, isRedirect } from "@tanstack/react-router";
import { c as createSsrRpc } from "./createSsrRpc-CkdUDiOt.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const ExchangeCodeInput = z.object({
  code: z.string().min(1),
  redirectUri: z.string().min(1)
});
const exchangeYoutubeCode = createServerFn({
  method: "POST"
}).inputValidator((data) => ExchangeCodeInput.parse(data)).handler(createSsrRpc("6b57fea92a564675273186e7443c6e91bfc3019e44d77584f72701acf9c87fac"));
export {
  exchangeYoutubeCode as e,
  useServerFn as u
};
