'use client';

import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  type Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
} from '@/components/kibo-ui/contribution-graph';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Seeded random number generator for consistent SSR/client rendering
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate deterministic activity data for the past year
const generateActivityData = (): Activity[] => {
  const data: Activity[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  let seed = 42;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    seed++;
    const random = seededRandom(seed);
    let level = 0;
    let count = 0;

    if (random > 0.3) {
      level = Math.floor(seededRandom(seed + 1000) * 4) + 1;
      count = level * Math.floor(seededRandom(seed + 2000) * 5) + 1;
    }

    data.push({
      date: d.toISOString().split('T')[0],
      count,
      level,
    });
  }

  return data;
};

// Pre-generate data at module level for consistency
const activityData = generateActivityData();

const Footer = () => {
  const graphRef = useRef(null);
  const isInView = useInView(graphRef, { once: true, margin: '-100px' });

  return (
    <footer className="section-padding container space-y-37.5 pb-16!">
      <TooltipProvider delayDuration={0}>
        <div ref={graphRef}>
          <ContributionGraph
            data={activityData}
            blockSize={12}
            blockMargin={4.5}
            blockRadius={2.4}
            fontSize={12}
            maxLevel={4}
            className="hidden w-full md:block"
          >
            <ContributionGraphCalendar hideMonthLabels>
              {({ activity, dayIndex, weekIndex }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {activity.level > 0 ? (
                      <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={
                          isInView
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 0, scale: 0 }
                        }
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          delay: weekIndex * 0.02 + dayIndex * 0.005,
                        }}
                      >
                        <ContributionGraphBlock
                          activity={activity}
                          dayIndex={dayIndex}
                          weekIndex={weekIndex}
                          className={cn(
                            'data-[level="1"]:fill-green-200',
                            'data-[level="2"]:fill-green-400',
                            'data-[level="3"]:fill-green-500',
                            'data-[level="4"]:fill-green-900',
                          )}
                        />
                      </motion.g>
                    ) : (
                      <ContributionGraphBlock
                        activity={activity}
                        dayIndex={dayIndex}
                        weekIndex={weekIndex}
                        className="fill-muted"
                      />
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {activity.count > 0
                      ? `${activity.count} contributions on ${activity.date}`
                      : `No contributions on ${activity.date}`}
                  </TooltipContent>
                </Tooltip>
              )}
            </ContributionGraphCalendar>
          </ContributionGraph>
        </div>
      </TooltipProvider>

      <div className="flex justify-center">
        <Link href="mailto:hi@john.me" className="link-underline text-lg">
          hi@john.me
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
