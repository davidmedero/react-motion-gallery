type ImageDecodeReadyOptions = {
    src?: string | null;
    srcSet?: string;
    sizes?: string;
    enabled?: boolean;
    timeoutMs?: number;
};
type ImageDecodeReadyResult = {
    ready: boolean;
    loading: boolean;
    error: boolean;
};
declare function useImageDecodeReady(options?: ImageDecodeReadyOptions): ImageDecodeReadyResult;

export { type ImageDecodeReadyOptions, type ImageDecodeReadyResult, useImageDecodeReady };
