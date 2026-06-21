'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CONTACT_EMAIL } from '@/lib/constants';

const MESSAGES = [
  "Okay, you've been hovering for a while... maybe hire me instead? 👀",
  "I see you like playing with animations. You know what's more fun? Working together! 🚀",
  'This is fun and all, but my inbox is feeling lonely... 💌',
  'Plot twist: the real treasure was the email you were about to send me 📧',
  "You've unlocked the secret message: I'm available for hire! 🎉",
];

type HireMePopupProps = {
  show: boolean;
  onDismiss: () => void;
};

export const HireMePopup = ({ show, onDismiss }: HireMePopupProps) => {
  const [message] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute -top-6 left-1/2 z-50 w-full max-w-md -translate-y-full"
          initial={{ opacity: 0, y: 20, x: '-50%', filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, x: '-50%', filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, x: '-50%', filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <Card>
            <CardContent className="">
              <p className="text-center text-base">{message}</p>
            </CardContent>
            <CardFooter className="justify-center gap-3">
              <Button asChild>
                <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>
              </Button>
              <Button variant="ghost" onClick={onDismiss}>
                Keep playing
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
