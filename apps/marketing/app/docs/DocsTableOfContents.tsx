"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./docs.module.css";

type TocItem = {
  id: string;
  label: string;
};

const ACTIVE_SECTION_OFFSET = 112;

export function DocsTableOfContents(props: { items: TocItem[] }) {
  const itemIds = useMemo(() => props.items.map((item) => item.id), [props.items]);
  const [activeId, setActiveId] = useState(itemIds[0] ?? "");

  useEffect(() => {
    if (itemIds.length === 0) {
      return;
    }

    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;

      const sections = itemIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section instanceof HTMLElement);

      if (sections.length === 0) {
        return;
      }

      const scrollPosition = window.scrollY + ACTIVE_SECTION_OFFSET;
      let nextActiveId = sections[0].id;

      for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop > scrollPosition) {
          break;
        }

        nextActiveId = section.id;
      }

      const pageBottom = Math.ceil(window.scrollY + window.innerHeight);
      const documentBottom = document.documentElement.scrollHeight;

      if (pageBottom >= documentBottom - 2) {
        nextActiveId = sections[sections.length - 1].id;
      }

      setActiveId((currentActiveId) =>
        currentActiveId === nextActiveId ? currentActiveId : nextActiveId
      );
    };

    const requestUpdate = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);

    return () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("hashchange", requestUpdate);
    };
  }, [itemIds]);

  return (
    <nav>
      <ul className={styles.tocList}>
        {props.items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li className={styles.tocItem} key={item.id}>
              <Link
                aria-current={isActive ? "location" : undefined}
                className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ""}`}
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
