import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { b as PlyrSource, c as PlyrOptions, A as APITypes } from './plyrTypes-B3vioQaS.mjs';
import './media.mjs';

type RmgPlyrSourceBuilder = (args: {
    src: string;
}) => PlyrSource;
type RmgPlyrOptionsResolver = PlyrOptions | ((args: {
    src: string;
    index: number;
}) => PlyrOptions);
type RmgVideoLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React.ReactNode | ((args: {
        kind: 'image' | 'video';
        isClone: boolean;
    }) => React.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React.CSSProperties;
};
type VideoProps = {
    src: string;
    poster?: string;
    alt?: string;
    source?: PlyrSource;
    sourceBuilder?: RmgPlyrSourceBuilder;
    options?: RmgPlyrOptionsResolver;
    className?: string;
    style?: React.CSSProperties;
    onApi?: (api: APITypes | null) => void;
    registerApiByIndex?: (index: number, api: APITypes | null) => void;
    lazyLoad?: RmgVideoLazyLoadOptions;
};
declare function Video(props: VideoProps): react_jsx_runtime.JSX.Element;

export { type RmgPlyrOptionsResolver, type RmgPlyrSourceBuilder, type RmgVideoLazyLoadOptions, Video, type VideoProps, Video as default };
