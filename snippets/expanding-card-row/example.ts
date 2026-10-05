// Example: mounting the "What we do" row. Plain TypeScript with any bundler
// (Vite, webpack, Next.js…); a React / Next.js version is at the bottom.
import { mountExpandingCardRow, type CardRowItem } from './expandingCardRow'
import './expandingCardRow.css'

// Your content. `points` (up to three) and `href` (where the open card's
// corner arrow goes) are optional.
const items: CardRowItem[] = [
  {
    title: 'Web Design',
    copy: 'Interfaces built around your content and your users, not a template — wireframed, art-directed, and refined until it feels inevitable.',
    points: [
      'Wireframed around your real content, not filler copy dropped into a theme',
      'Art-directed pages, not a stack of default component blocks',
      'A design your next hire can extend without redoing it',
    ],
    href: '/services/web-design',
  },
  {
    title: 'Development',
    copy: 'Hand-built front ends with lean, modern tooling. No bloated CMS, no unnecessary dependencies — just fast, maintainable code.',
    points: [
      'No unnecessary dependencies — every line of code earns its place',
      'Built to pass Core Web Vitals, not just look fine in a demo',
      'Code your next developer can actually read',
    ],
    href: '/services/development',
  },
  {
    title: 'Brand & Identity',
    copy: 'Logo, type system, color, voice — a visual language that holds up across the site, social, and everything after launch.',
    points: [
      'A type system and color palette you can actually apply, not just admire',
      'A voice guide so your copy sounds like one business, not five',
      'Assets that hold up at a business card and a billboard',
    ],
    href: '/services/brand-identity',
  },
  {
    title: 'SEO & Performance',
    copy: 'Sites that load in a blink and rank because of it. Technical SEO, Core Web Vitals, and clean semantic markup from day one.',
    points: [
      'Technical SEO built into the code, not added as a plugin later',
      'Core Web Vitals that actually pass, not just report green once',
      'Semantic markup search engines can genuinely understand',
    ],
    href: '/services/seo-performance',
  },
]

// Mounts into <section id="services"></section>.
const row = mountExpandingCardRow(document.querySelector<HTMLElement>('#services')!, {
  heading: 'What we <em>do</em>',
  items,
  // Optional, shown with their defaults:
  // fillScreen: true,        one screen tall; the page glides to it on scroll
  // wheelScroll: true,       a vertical wheel over the section scrolls the row
  // wheelSensitivity: 2.5,
  // movingLines: true,       animated canvas lines on the open card
  // themes: ['purple', 'green', 'gold', 'ink'],
  // label: 'Services',       the row's name for screen readers
  // showCount: true,         "(04)" beside the heading
})

// Control it from outside, or remove it (e.g. on a route change):
// row.open(2)
// row.close()
// row.destroy()
void row

/* Your colours and fonts — set them on the section (defaults shown):

#services {
  --ecr-ink: #333333;          borders, shadows, dark text
  --ecr-bg: #fef9e7;           the section background (the corner notch is cut in it)
  --ecr-light: #fef9e7;        text on the cards
  --ecr-accent: #6c3baa;       focus rings, the count
  --ecr-accent-2: #3baa99;     the scrollbar thumb, the heading's <em>
  --ecr-font-display: "Bricolage Grotesque", sans-serif;
  --ecr-nav-h: 88px;           height of a fixed header, if the page has one
}
*/

/* React / Next.js (App Router):

'use client'
import { useEffect, useRef } from 'react'
import { mountExpandingCardRow } from './expandingCardRow'
import './expandingCardRow.css'

export function WhatWeDo() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const row = mountExpandingCardRow(ref.current!, { heading: 'What we <em>do</em>', items })
    return () => row.destroy()
  }, [])
  return <section ref={ref} />
}
*/
