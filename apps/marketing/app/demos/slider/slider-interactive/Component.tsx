/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from "react";
import {
  GalleryCore,
  Slider,
  createSliderIndexChannel,
  useGalleryCore,
  type GalleryApi,
  type SliderHandle,
  type SliderIndexChannel,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-interactive-demo.module.css";

const INITIAL_IMAGE_IDS = [1025, 1035, 1043, 1050, 1062, 1074];

type RemoveMode = "index" | "even" | "odd";

function buildPicsumSrc(imageId: number) {
  return `https://picsum.photos/id/${imageId}/1200/900`;
}

function parseImageIds(value: string) {
  return value
    .split(/[,\s]+/)
    .map((entry) => Number.parseInt(entry, 10))
    .filter((entry) => Number.isFinite(entry) && entry >= 0);
}

function InteractiveSlide(props: { imageId: number }) {
  const { imageId } = props;

  return (
    <article className={styles.slideCard}>
      <img
        src={buildPicsumSrc(imageId)}
        alt={`Picsum ${imageId}`}
        className={styles.slideImage}
      />
      <div className={styles.slideMeta}>
        <span className={styles.slideEyebrow}>Picsum #{imageId}</span>
      </div>
    </article>
  );
}

function ControlCard(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <section className={styles.controlCard}>
      {children}
    </section>
  );
}

function useInteractiveGalleryApi(args: {
  sliderRef: React.RefObject<SliderHandle | null>;
  indexChannel: SliderIndexChannel;
}) {
  const { sliderRef, indexChannel } = args;
  const core = useGalleryCore();

  return React.useMemo<GalleryApi>(() => {
    return {
      rootNode: () => sliderRef.current?.getRootNode() ?? null,
      containerNode: () => sliderRef.current?.getContainerNode() ?? null,
      getViewportNode: () => sliderRef.current?.getViewportNode() ?? null,
      slideNodes: () => sliderRef.current?.getSlideNodes() ?? [],
      onReady: (cb) => sliderRef.current?.onSlidesBuilt(cb) ?? (() => {}),
      whenReady: () => sliderRef.current?.whenSlidesBuilt() ?? Promise.resolve([]),
      isReady: () => sliderRef.current?.isSlidesBuilt() ?? false,
      scrollTo: (index, jump) => {
        sliderRef.current?.setIndex(index, jump ? "instant" : "animated");
      },
      scrollNext: (jump) => {
        sliderRef.current?.scrollNext(jump ? "instant" : "animated");
      },
      scrollPrev: (jump) => {
        sliderRef.current?.scrollPrev(jump ? "instant" : "animated");
      },
      canScrollNext: () => sliderRef.current?.canScrollNext() ?? false,
      canScrollPrev: () => sliderRef.current?.canScrollPrev() ?? false,
      getIndex: () => sliderRef.current?.getIndex() ?? 0,
      selectCell: (index, jump) => {
        const slideIndex = sliderRef.current?.slideIndexForCell(index) ?? index;
        sliderRef.current?.setIndex(slideIndex, jump ? "instant" : "animated");
      },
      scrollProgress: () => sliderRef.current?.scrollProgress() ?? 0,
      cellsInView: () => sliderRef.current?.cellsInView() ?? [],
      append: core.append,
      prepend: core.prepend,
      insert: core.insert,
      remove: (indexOrPredicate) => {
        if (typeof indexOrPredicate === "number") {
          return core.remove(indexOrPredicate);
        }

        const nextNodes: React.ReactNode[] = [];
        let removedAny = false;

        core.cellsRef.current.forEach((cell, index) => {
          if (indexOrPredicate(index)) {
            removedAny = true;
            return;
          }

          nextNodes.push(cell.node);
        });

        return removedAny ? core.setItems(nextNodes) : core.cellsRef.current.length;
      },
      replace: core.replace,
      setItems: core.setItems,
      onIndexChange: (cb) =>
        indexChannel.subscribe(() => {
          const { index, mode } = indexChannel.get();
          cb(index, { mode });
        }),
      openFullscreenAt: core.openFullscreenAt,
    };
  }, [core, indexChannel, sliderRef]);
}

function InteractiveSliderCanvas() {
  const sliderRef = React.useRef<SliderHandle | null>(null);
  const nodeSeqRef = React.useRef(INITIAL_IMAGE_IDS.length);
  const indexChannel = React.useMemo(() => createSliderIndexChannel(), []);
  const api = useInteractiveGalleryApi({ sliderRef, indexChannel });

  const [appendValue, setAppendValue] = React.useState("1080, 1081");
  const [prependValue, setPrependValue] = React.useState("1011");
  const [insertIndex, setInsertIndex] = React.useState("2");
  const [insertValue, setInsertValue] = React.useState("1039");
  const [removeMode, setRemoveMode] = React.useState<RemoveMode>("index");
  const [removeValue, setRemoveValue] = React.useState("0");
  const [replaceIndex, setReplaceIndex] = React.useState("1");
  const [replaceValue, setReplaceValue] = React.useState("1070");
  const [setItemsValue, setSetItemsValue] = React.useState(INITIAL_IMAGE_IDS.join(", "));
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(INITIAL_IMAGE_IDS.length);

  const createSlideNode = React.useCallback((imageId: number) => {
    nodeSeqRef.current += 1;
    return (
      <InteractiveSlide
        key={`interactive-slide-${nodeSeqRef.current}`}
        imageId={imageId}
      />
    );
  }, []);

  const initialNodes = React.useMemo(
    () => INITIAL_IMAGE_IDS.map((imageId, i) => (
      <InteractiveSlide key={`interactive-slide-${i + 1}`} imageId={imageId} />
    )),
    []
  );

  const toNodes = React.useCallback(
    (imageIds: number[]) => {
      const nodes = imageIds.map((imageId) => createSlideNode(imageId));
      return nodes.length === 1 ? nodes[0] : nodes;
    },
    [createSlideNode]
  );

  React.useEffect(() => {
    const unsubscribe = api.onIndexChange((index) => {
      setActiveIndex(index);
    });

    setActiveIndex(api.getIndex());

    const syncCount = () => {
      setItemCount(api.slideNodes().length);
    };

    if (api.isReady?.()) {
      syncCount();
    }

    const unsubscribeReady = api.onReady?.(syncCount) ?? (() => {});

    return () => {
      unsubscribe();
      unsubscribeReady();
    };
  }, [api]);

  const handleAppend = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const imageIds = parseImageIds(appendValue);
      if (imageIds.length === 0) return;

      const total = api.append(toNodes(imageIds));
      setItemCount(total);
    },
    [api, appendValue, toNodes]
  );

  const handlePrepend = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const imageIds = parseImageIds(prependValue);
      if (imageIds.length === 0) return;

      const total = api.prepend(toNodes(imageIds));
      setItemCount(total);
    },
    [api, prependValue, toNodes]
  );

  const handleInsert = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const targetIndex = Number.parseInt(insertIndex, 10);
      const imageIds = parseImageIds(insertValue);
      if (!Number.isFinite(targetIndex) || imageIds.length === 0) return;

      const total = api.insert(targetIndex, toNodes(imageIds));
      setItemCount(total);
    },
    [api, insertIndex, insertValue, toNodes]
  );

  const handleRemove = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (removeMode === "index") {
        const targetIndex = Number.parseInt(removeValue, 10);
        if (!Number.isFinite(targetIndex)) return;

        const total = api.remove(targetIndex);
        setItemCount(total);
        return;
      }

      const predicate = removeMode === "even"
        ? (index: number) => index % 2 === 0
        : (index: number) => index % 2 === 1;
      const total = api.remove(predicate);
      setItemCount(total);
    },
    [api, removeMode, removeValue]
  );

  const handleReplace = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const targetIndex = Number.parseInt(replaceIndex, 10);
      const nextImageId = Number.parseInt(replaceValue, 10);
      if (!Number.isFinite(targetIndex) || !Number.isFinite(nextImageId) || nextImageId < 0) {
        return;
      }

      api.replace(targetIndex, createSlideNode(nextImageId));
    },
    [api, createSlideNode, replaceIndex, replaceValue]
  );

  const handleSetItems = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const imageIds = parseImageIds(setItemsValue);
      if (imageIds.length === 0) return;

      const total = api.setItems(imageIds.map((imageId) => createSlideNode(imageId)));
      setItemCount(total);
    },
    [api, createSlideNode, setItemsValue]
  );

  return (
    <div className={styles.shell}>
      <Slider
        ref={sliderRef}
        indexChannel={indexChannel}
        layout={{
          gap: 14,
          cellsPerSlide: {
            xs: 1,
            md: 2,
          },
        }}
        controls={{
          arrows: {
            enabled: true,
          },
          dots: {
            enabled: true,
            root: {
              style: {
                bottom: "5px"
              }
            }
          },
        }}
        elements={{
          viewport: {
            style: {
              paddingBottom: "52px"
            }
          }
        }}
        transitions={{
          loading: {
            skeletonCount: { xs: 1, md: 2 },
            skeleton: {
              mode: "fit",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 14,
                },
                item: {
                  kind: "col",
                  style: {
                    gap: 12,
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: "12px 12px 0 0",
                      },
                    },
                    {
                      kind: "text",
                      fontSize: 14,
                      lineHeight: 1.1,
                      style: {
                        width: "30%",
                        marginTop: '2px',
                        marginLeft: "12px",
                        marginBottom: "12px"
                      },
                    },
                  ],
                },
                children: [
                  {
                    kind: "col",
                    style: {
                      width: "100%",
                      padding: "14px 0 0",
                    },
                    children: [
                      {
                        kind: "rect",
                        style: {
                          xs: {
                            width: 160,
                            height: 32,
                            borderRadius: 999,
                            alignSelf: "center",
                            marginBottom: "6px"
                          },
                          md: {
                            width: 138,
                          }
                        },
                      },
                    ],
                  },
                ],
                itemWrapStyle: {
                  overflow: "hidden",
                  border: "1px solid #dbe4f0",
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                }
              },
            },
          },
        }}
      >
        {initialNodes}
      </Slider>

      <div className={styles.metaBar}>
        <span className={styles.metaPill}>index {activeIndex}</span>
        <span className={styles.metaPill}>{itemCount} items</span>
      </div>

      <div className={styles.controlGrid}>
        <ControlCard>
          <form className={styles.controlForm} onSubmit={handleAppend}>
            <div className={styles.fieldRowCompact}>
              <input
                value={appendValue}
                onChange={(event) => setAppendValue(event.target.value)}
                className={styles.textInput}
                placeholder="picsum ids"
                aria-label="Append picsum ids"
              />
              <button type="submit" className={styles.actionButton}>
                append
              </button>
            </div>
          </form>
        </ControlCard>

        <ControlCard>
          <form className={styles.controlForm} onSubmit={handlePrepend}>
            <div className={styles.fieldRowCompact}>
              <input
                value={prependValue}
                onChange={(event) => setPrependValue(event.target.value)}
                className={styles.textInput}
                placeholder="picsum ids"
                aria-label="Prepend picsum ids"
              />
              <button type="submit" className={styles.actionButton}>
                prepend
              </button>
            </div>
          </form>
        </ControlCard>

        <ControlCard>
          <form className={styles.controlForm} onSubmit={handleInsert}>
            <div className={styles.fieldRow}>
              <input
                value={insertIndex}
                onChange={(event) => setInsertIndex(event.target.value)}
                className={styles.numberInput}
                inputMode="numeric"
                placeholder="index"
                aria-label="Insert index"
              />
              <input
                value={insertValue}
                onChange={(event) => setInsertValue(event.target.value)}
                className={styles.textInput}
                placeholder="picsum ids"
                aria-label="Insert picsum ids"
              />
              <button type="submit" className={styles.actionButton}>
                insert
              </button>
            </div>
          </form>
        </ControlCard>

        <ControlCard>
          <form className={styles.controlForm} onSubmit={handleRemove}>
            <div className={styles.fieldRow}>
              <select
                value={removeMode}
                onChange={(event) => setRemoveMode(event.target.value as RemoveMode)}
                className={styles.selectInput}
                aria-label="Remove mode"
              >
                <option value="index">index</option>
                <option value="even">even</option>
                <option value="odd">odd</option>
              </select>
              <input
                value={removeValue}
                onChange={(event) => setRemoveValue(event.target.value)}
                className={styles.numberInput}
                inputMode="numeric"
                placeholder="index"
                disabled={removeMode !== "index"}
                aria-label="Remove index"
              />
              <button type="submit" className={styles.actionButton}>
                remove
              </button>
            </div>
          </form>
        </ControlCard>

        <ControlCard>
          <form className={styles.controlForm} onSubmit={handleReplace}>
            <div className={styles.fieldRow}>
              <input
                value={replaceIndex}
                onChange={(event) => setReplaceIndex(event.target.value)}
                className={styles.numberInput}
                inputMode="numeric"
                placeholder="index"
                aria-label="Replace index"
              />
              <input
                value={replaceValue}
                onChange={(event) => setReplaceValue(event.target.value)}
                className={styles.textInput}
                placeholder="picsum id"
                aria-label="Replace picsum id"
              />
              <button type="submit" className={styles.actionButton}>
                replace
              </button>
            </div>
          </form>
        </ControlCard>

        <ControlCard>
          <form className={styles.controlForm} onSubmit={handleSetItems}>
            <div className={styles.fieldRowCompact}>
              <input
                value={setItemsValue}
                onChange={(event) => setSetItemsValue(event.target.value)}
                className={styles.textInput}
                placeholder="picsum ids"
                aria-label="Set items picsum ids"
              />
              <button type="submit" className={styles.actionButton}>
                setItems
              </button>
            </div>
          </form>
        </ControlCard>
      </div>
    </div>
  );
}

export function SliderInteractiveDemo() {
  return (
    <GalleryCore layout="slider">
      <InteractiveSliderCanvas />
    </GalleryCore>
  );
}
