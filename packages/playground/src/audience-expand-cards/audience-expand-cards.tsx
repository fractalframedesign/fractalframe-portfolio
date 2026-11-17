'use client';

import './audience-expand-cards.css';

import { useState } from 'react';

export type AudienceCard = {
  number: string;
  label: string;
  title: string;
  description: string;
  /** A second line under the description. Leave empty for none */
  detail: string;
  cta: string;
  image: string;
  alt: string;
  href: string;
  /** CSS background-position for the picture */
  position: string;
};

export default function AudienceExpandCards({
  items,
}: {
  items: AudienceCard[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="audience-cards" aria-label="Choose your website audience">
      {items.map((audience, index) => {
        const isActive = activeIndex === index;

        return (
          <article
            className={`audience-card${isActive ? ' is-active' : ''}`}
            key={audience.number}
            style={{
              backgroundImage: `linear-gradient(180deg, rgb(0 0 0 / 0.02) 20%, rgb(0 0 0 / 0.78) 100%), url("${audience.image}")`,
              backgroundPosition: audience.position,
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setActiveIndex(index);
            }}
          >
            <button
              className="audience-card__select"
              type="button"
              aria-expanded={isActive}
              aria-label={`${audience.label.replace('FOR ', '')}: ${audience.title}`}
              onClick={() => setActiveIndex(index)}
            >
              <span className="audience-card__meta">
                <span>{audience.number}</span>
                <span className="audience-card__label">{audience.label}</span>
              </span>
              <span className="audience-card__content">
                <span className="audience-card__title">{audience.title}</span>
                <span className="audience-card__details">
                  <span>{audience.description}</span>
                  {audience.detail ? <span>{audience.detail}</span> : null}
                </span>
              </span>
            </button>
            <a
              className="audience-card__cta"
              href={audience.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
            >
              {audience.cta}<span aria-hidden="true">↗</span>
            </a>
          </article>
        );
      })}
    </div>
  );
}
