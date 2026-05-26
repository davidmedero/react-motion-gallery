import { createCoreMasonrySource } from "../_core/source";

export const source = createCoreMasonrySource({
  componentName: "MasonryCoreLazyLoadDemo",
  cssModuleName: "masonry-core-lazy-load-demo.module.css",
  placement: "balanced",
  variant: "lazyLoad",
});
