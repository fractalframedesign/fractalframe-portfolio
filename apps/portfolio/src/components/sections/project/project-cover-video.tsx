'use client';

import { PauseIcon, PlayIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

interface ProjectCoverVideoProps {
  src: string;
  poster: string;
  label: string;
}

/** Muted looping cover video. Stays on the poster when the visitor prefers reduced motion. */
const ProjectCoverVideo = ({ src, poster, label }: ProjectCoverVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause();
    }
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={label}
        className="size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className="absolute right-3 bottom-3 rounded-full opacity-80 hover:opacity-100"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </>
  );
};

export default ProjectCoverVideo;
