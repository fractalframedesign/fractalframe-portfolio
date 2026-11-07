'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

const EASE = [0.23, 1, 0.32, 1] as const;

/** The five levels, from the base up; each only counts once the one below it holds. */
const levels = [
  {
    title: 'Minimal & functional',
    description:
      'It does the one thing people came for. That is the whole test. A person opens the product with a job in mind and asks one question. Can I do it here. If the answer is no, nothing above this level exists for them. Not the animation. Not the brand. Start here, and stay here longer than feels comfortable.',
  },
  {
    title: 'Reliable & stable',
    description:
      'It works every time. Not most of the time. A feature that fails one time in ten teaches people to brace before they tap. They save twice. They take screenshots as proof. That is not trust. That is a workaround. Reliability is invisible when it is there, and it is the only thing people talk about when it is gone.',
  },
  {
    title: 'User-friendly',
    description:
      'Now the product works, and people can stop surviving it. This level is about effort. Is it easy to learn. Is it hard to get wrong. A friendly interface does not make people feel clever. It makes them forget the interface. They reach the goal and remember the goal. If they remember your navigation, something went wrong.',
  },
  {
    title: 'Polished',
    description:
      'Polish is not decoration. It is evidence. Spacing that lines up, motion that explains, copy that sounds like a person. Each detail tells people that someone cared about the parts they were never supposed to notice. People cannot always say why a product feels trustworthy. They can always feel when it does not. Polish on a broken product is makeup. On a working one, it is respect.',
  },
  {
    title: 'New',
    description:
      'Only now does new matter. Something people have not seen before. A reason to come back, and a reason to tell someone. Most teams want to start here. I understand why. This is the level that gets the applause. But novelty on a weak base is a demo, not a product. Earn the four levels below it first. Then surprise people.',
  },
];

// The base appears first and the pyramid builds upward
export function DesignMotivation() {
  return (
    <div className="space-y-8 md:space-y-10">
      <div className="max-w-2xl space-y-3">
        <motion.h2
          className="text-2xl leading-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          Design to motivate
        </motion.h2>
        <div className="text-muted-foreground space-y-6 text-lg leading-relaxed">
          <p>
            Motivation is the reason a person acts. Not the reason you hoped
            they would. The reason they actually had.
          </p>
          <p>
            In 1943, Abraham Maslow published{' '}
            <em>A Theory of Human Motivation</em>. His argument was simple. A
            need only starts to matter once the needs beneath it are met. In
            plain terms, nobody thinks about self-expression while they are
            hungry.
          </p>
          <p>
            Maslow was writing about people, not software. He never drew a
            pyramid either. Others drew it for him later. But the order is the
            part that lasted, and the order is what most product teams skip.
            They agree that the base matters. Then they spend the quarter on the
            top.
          </p>
          <p>
            Products work the same way. In 2011, Aarron Walter redrew the idea
            for interfaces in <em>Designing for Emotion</em>. I use my own
            version of it in every review. Five levels, read from the bottom up.
            Each one only counts once the one below it holds. I have built them
            in the wrong order too. It never works.
          </p>
        </div>
      </div>
      <ol className="space-y-8">
        {levels.map((level, index) => (
          <motion.li
            key={level.title}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-x-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: EASE, delay: index * 0.08 }}
          >
            <span className="text-muted-foreground pt-1 text-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-xl leading-snug md:text-2xl">{level.title}</h3>
            <p className="text-muted-foreground col-start-2 max-w-2xl text-lg leading-relaxed">
              {level.description}
            </p>
          </motion.li>
        ))}
      </ol>
      <motion.p
        className="max-w-2xl text-xl leading-snug md:text-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        People do not climb your pyramid. They stand on whatever level you
        finished.
      </motion.p>
      <Link
        href="/articles/design-to-motivate"
        className="link-underline inline-block text-base leading-none"
      >
        Read the full story
      </Link>
    </div>
  );
}
