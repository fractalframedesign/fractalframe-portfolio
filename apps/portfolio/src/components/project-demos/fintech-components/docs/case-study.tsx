import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/*
  Illustrative project details. The company, team size, timeline and every metric
  below are placeholders. Replace them with the real figures before publishing.
  Facts that come from this project itself: 97 widgets, 305 tokens, 4 collections,
  156 raw / 117 semantic colour tokens, 57 widgets with a loading state.
*/

const facts = [
  { label: 'Role', value: 'Design lead, design system' },
  { label: 'Team', value: '2 designers, 6 engineers, 1 QA' },
  { label: 'Timeline', value: '5 months, shipped in stages' },
  { label: 'Scope', value: '97 widgets, 305 tokens' },
];

type Block = { heading?: string; paragraphs: string[] };

type Section = {
  id: string;
  label: string;
  blocks: Block[];
};

const sections: Section[] = [
  {
    id: 'overview',
    label: 'Overview',
    blocks: [
      {
        paragraphs: [
          'This is the design system I built for a digital bank. About 1.4 million customers, a consumer app, a small-business dashboard and a white-label version for a partner. Five product squads shipped to it every two weeks.',
          'The system is 97 interactive widgets, grouped by what people do with money: cards and payments, transactions, budgeting, savings, balances, investing and insights. Under them sits one token library of 305 variables. Colour, corner radius and spacing live there and nowhere else.',
          'It is written for the people who touch a screen after I do. Front-end engineers who need a component they can trust. Designers who need to stop redrawing the same card. Product managers who want to know why a change takes a week instead of an hour. And QA, who were the first to feel the pain.',
        ],
      },
    ],
  },
  {
    id: 'problem',
    label: 'Problem',
    blocks: [
      {
        heading: 'Five squads, five versions of the truth',
        paragraphs: [
          'Nobody did anything wrong. Each squad had a roadmap and a deadline, so each squad built what it needed. Cards built a balance widget. Payments built one. Savings built one. Insights built the fourth, with a chart inside it. All four looked like the same thing. None of them were.',
          'I did not believe the scale of it until I counted. I pulled every colour out of the production stylesheets. 212 unique hex values. Eleven of them were blue. Three were doing the job of the primary button.',
          'That is what it felt like from the inside too. Which blue is the real one. Is this the new card or the old card. Can I just copy the hex from the last screen.',
          'The costs were quiet. Loading states differed on every screen: one spinner, one blank flash, one skeleton cut to the wrong height. Dark mode had shipped on three screens as a workaround, and secondary text in it failed contrast. Design QA spent two days on every release finding drift that had shipped the release before.',
        ],
      },
      {
        heading: 'The constraint that forced the issue',
        paragraphs: [
          'A partner bank wanted our product under their own brand. Their buttons were pills. Ours were rounded rectangles. Changing that meant touching every button in every squad\'s code, and there was no shared place to touch. The honest answer from engineering was a fork. A fork of a banking app is a second product to secure, test and audit, forever.',
          'The rules around it were tight. We could not freeze the roadmap. Payment confirmation flows could not change meaning, only appearance, because compliance had signed them off. Nobody was going to give me a quarter to rewrite everything. Whatever I built had to be adopted one squad at a time, while those squads kept shipping.',
        ],
      },
    ],
  },
  {
    id: 'approach',
    label: 'Approach',
    blocks: [
      {
        heading: 'I started in the wrong place',
        paragraphs: [
          'I opened Figma first. I still catch myself doing this. Two days later I had a tidy component file that nobody had asked for and nobody would have used.',
          'So I closed it and booked thirty minutes with the front-end lead. No slides. I asked her to show me the last three bugs that started with "why is this different". That was the real brief. Two of the three were the same bug in different clothes: a value copied by hand from one screen to another, drifting from there.',
          'That changed the plan. The problem was not a shortage of components. A decision made in design never reached the code as a decision. It reached it as a hex value.',
        ],
      },
      {
        heading: 'Tokens before components',
        paragraphs: [
          'So I started with tokens, and I started with the engineers in the room. We agreed on two layers. Raw tokens hold the values: a purple, a gray, an alpha step. Semantic tokens hold the meaning: primary button, neutral surface, success text. Components read only the second layer.',
          'We agreed on one more thing that mattered more than it sounds. Theme and corner radius are separate axes. Light and dark is one switch. Square and round is another. Together they give four combinations from two attributes on the page. That is what killed the fork. The partner\'s pill buttons became a mode, not a branch.',
          'Then the count came up. 305 variables. The first reaction from engineering was fair. Three hundred tokens is three hundred things to get wrong. I showed them the split. 156 are the raw palette, generated in steps and never referenced by a component. The 117 semantic colours are the ones anyone touches, and they follow three roles (primary, secondary, neutral) plus success and error. Fifteen radii. Seventeen spacing steps.',
          'We added a lint rule that rejects a hex value or a raw palette token inside a component. It found 41 violations on day one. It has not found many since.',
        ],
      },
      {
        heading: 'One source, generated',
        paragraphs: [
          'Figma variables and CSS variables carry the same names. The CSS file is generated from the Figma export and is never edited by hand. If a designer changes a value, the diff arrives as a pull request and an engineer reviews it. If an engineer needs a new value, it starts in Figma. Neither side can drift quietly, because the file is the only door.',
        ],
      },
      {
        heading: 'Every widget has a loading state',
        paragraphs: [
          'This came out of a QA conversation, not a design one. Every widget takes a loading prop. Set it and the widget renders a skeleton of itself at the correct size. Leave it unset and the widget manages its own refresh. All 57 production widgets follow that contract, so nobody has to invent a loading state again.',
          'Charts were the awkward part. The chart library does not read utility classes, so chart fills point at explicit chart tokens instead. That made charts the first place we could prove dark mode worked.',
        ],
      },
      {
        heading: 'Adoption, not launch',
        paragraphs: [
          'I did not launch a system. I picked the six widgets with the most traffic: balance, transactions, card, transfer, payment confirmation and savings goal. Each went in behind a flag, one squad at a time. I sat in each squad\'s planning for that sprint and took the tickets that touched those screens. The squad got faster in the first week. That is how the system got adopted. Not a mandate. A shorter path.',
          'The documentation is part of the product. Every widget has a live preview with its source one click away. The token explorer lets anyone search a value, flip between light and dark, and copy the variable. A new widget follows a template, and a designer and an engineer both approve it.',
        ],
      },
    ],
  },
  {
    id: 'outcome',
    label: 'Outcome',
    blocks: [
      {
        heading: 'What shipped',
        paragraphs: [
          '97 widgets in eight groups, on 305 tokens across four collections. Light and dark. Square and round. A loading state on every production widget. A live documentation site and a token explorer the whole company can search.',
        ],
      },
    ],
  },
];

const outcomeStats = [
  { value: '2 days to 4 hours', label: 'Design QA per release' },
  { value: '4 to 1', label: 'Balance widgets in production' },
  { value: '0 forks', label: 'White-label pilot, launched on the promised date' },
];

const outcomeClosing: Block[] = [
  {
    heading: 'What I learned',
    paragraphs: [
      'The partner pilot launched on the date we promised. Their pills came from one attribute and one token set. The security review covered one codebase.',
      'Naming was most of the work. We spent longer arguing over whether something was "tertiary" or "quarterly" than over any pixel. It was worth it. A good name stops the next argument before it starts.',
      'I was wrong about one thing. I expected engineers to resist the rules. They resisted nothing that removed work. They resisted anything that added a step. The lint rule survived because it saved a review comment. The pull request checklist I wrote in week two did not survive a month.',
      'It is not finished. Motion has no tokens yet, so animation still drifts. And the widget theme in code is a parallel set of roles that I want wired directly to the token file, so a change in Figma reaches a live screen with no translation in between. Knowing the gap exists does not close it.',
      'A design system is not a library. It is an agreement, and the library is only the receipt.',
    ],
  },
];

function Prose({ block }: { block: Block }) {
  return (
    <div className="space-y-4">
      {block.heading && (
        <h3 className="pt-4 text-xl font-semibold tracking-tight">{block.heading}</h3>
      )}
      {block.paragraphs.map((text) => (
        <p key={text} className="text-muted-foreground max-w-3xl text-lg leading-relaxed text-pretty">
          {text}
        </p>
      ))}
    </div>
  );
}

/** Case study for the Fintech Components design system. */
export function FintechCaseStudy() {
  return (
    <div className="space-y-14">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="border-border bg-card rounded-xl border p-4">
            <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1 font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Case study sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`#${section.id}`}
                  className="text-muted-foreground hover:text-foreground block py-1.5 text-sm transition-colors"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-20">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{section.label}</h2>
              {section.blocks.map((block, index) => (
                <Prose key={block.heading ?? index} block={block} />
              ))}

              {section.id === 'outcome' && (
                <>
                  <ul className="grid gap-4 sm:grid-cols-3">
                    {outcomeStats.map((stat) => (
                      <li key={stat.label}>
                        <Card className="h-full">
                          <CardContent className="space-y-1">
                            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                            <p className="text-muted-foreground text-sm">{stat.label}</p>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                  {outcomeClosing.map((block) => (
                    <Prose key={block.heading} block={block} />
                  ))}
                </>
              )}
            </section>
          ))}

          <div className="border-border flex flex-wrap gap-3 border-t pt-8">
            <Button asChild>
              <Link href="/showcase/fintech-components">See the components</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/showcase/fintech-components/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
