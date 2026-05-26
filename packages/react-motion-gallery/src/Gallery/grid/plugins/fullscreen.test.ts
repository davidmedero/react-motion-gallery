// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest";

import {
  resolveGridFullscreenClick,
  shouldSuppressGridFullscreenClick,
} from "./fullscreen";

function render(markup: string) {
  document.body.innerHTML = markup;
  return document.body.firstElementChild as HTMLElement;
}

describe("grid fullscreen click resolution", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("media trigger mode opens from images but not arbitrary card content", () => {
    const item = render(`
      <article data-rmg-idx="2">
        <img id="photo" src="/photo.jpg" alt="" />
        <p id="copy">Details</p>
      </article>
    `);

    const image = item.querySelector("#photo") as HTMLImageElement;
    const copy = item.querySelector("#copy") as HTMLElement;

    expect(resolveGridFullscreenClick(copy, { fullscreenTrigger: "media" })).toBeNull();
    expect(resolveGridFullscreenClick(image, { fullscreenTrigger: "media" })).toEqual({
      index: 2,
      image,
    });
  });

  test("explicit fullscreen triggers open in media mode", () => {
    const item = render(`
      <article data-rmg-idx="3">
        <img id="photo" src="/photo.jpg" alt="" />
        <button id="trigger" data-rmg-fullscreen-trigger>Open</button>
      </article>
    `);

    const image = item.querySelector("#photo") as HTMLImageElement;
    const trigger = item.querySelector("#trigger") as HTMLButtonElement;

    expect(resolveGridFullscreenClick(trigger, { fullscreenTrigger: "media" })).toEqual({
      index: 3,
      image,
    });
  });

  test("item trigger mode opens from card body using the card image", () => {
    const item = render(`
      <article data-rmg-idx="4">
        <img id="photo" src="/photo.jpg" alt="" />
        <p id="copy">Details</p>
      </article>
    `);

    const image = item.querySelector("#photo") as HTMLImageElement;
    const copy = item.querySelector("#copy") as HTMLElement;

    expect(resolveGridFullscreenClick(copy, { fullscreenTrigger: "item" })).toEqual({
      index: 4,
      image,
    });
  });

  test("interactive and video surfaces only open through explicit triggers", () => {
    const item = render(`
      <article data-rmg-idx="5">
        <div class="plyr" id="video"></div>
        <img id="poster" src="/poster.jpg" alt="" />
        <button id="button">Native button</button>
        <button id="trigger" data-rmg-fullscreen-trigger>
          <img id="icon" src="/open.jpg" alt="" />
        </button>
      </article>
    `);

    const video = item.querySelector("#video") as HTMLElement;
    const button = item.querySelector("#button") as HTMLButtonElement;
    const trigger = item.querySelector("#trigger") as HTMLButtonElement;
    const icon = item.querySelector("#icon") as HTMLImageElement;

    expect(resolveGridFullscreenClick(video, { fullscreenTrigger: "item" })).toBeNull();
    expect(resolveGridFullscreenClick(button, { fullscreenTrigger: "item" })).toBeNull();
    expect(resolveGridFullscreenClick(trigger, { fullscreenTrigger: "item" })).toEqual({
      index: 5,
      image: icon,
    });
  });

  test("drag movement above threshold suppresses click-open", () => {
    expect(
      shouldSuppressGridFullscreenClick({ x: 10, y: 10, id: 1 }, { clientX: 12, clientY: 13 })
    ).toBe(false);
    expect(
      shouldSuppressGridFullscreenClick({ x: 10, y: 10, id: 1 }, { clientX: 20, clientY: 20 })
    ).toBe(true);
  });
});
