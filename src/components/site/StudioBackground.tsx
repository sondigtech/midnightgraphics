import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STUDIO_SLIDE_INTERVAL_MS, nextStudioSlide } from "@/lib/studio-slideshow";
import studioOne from "@/assets/designer-studio-01.jpg";
import studioTwo from "@/assets/designer-studio-02.jpg";
import studioThree from "@/assets/designer-studio-03.jpg";

const STUDIOS = [studioOne, studioTwo, studioThree];

export function StudioBackground() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => nextStudioSlide(current, STUDIOS.length));
    }, STUDIO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  return (
    <>
      <div className="studio-background absolute inset-0 overflow-hidden" aria-hidden="true" data-active-slide={active}>
        {STUDIOS.map((src, index) => (
          <img key={src} src={src} alt="" width={1536} height={1024} fetchPriority={index === 0 ? "high" : "auto"}
            className={`studio-slide absolute inset-0 h-full w-full object-cover ${index === active ? "studio-slide-active" : ""}`} />
        ))}
        <div className="studio-shade absolute inset-0" />
      </div>
      <div className="studio-controls absolute bottom-3 left-4 z-10 flex items-center gap-1 sm:bottom-6 sm:left-auto sm:right-8" role="group" aria-label="Studio backgrounds">
        <Button variant="ghost" size="icon" className="studio-control h-8 w-8" aria-label="Previous studio" title="Previous studio" onClick={() => setActive((active + STUDIOS.length - 1) % STUDIOS.length)}><ChevronLeft className="h-4 w-4" /></Button>
        {STUDIOS.map((_, index) => <Button key={index} variant="ghost" size="icon" className="studio-control h-8 w-8" aria-label={`Studio ${index + 1}`} aria-pressed={active === index} title={`Studio ${index + 1}`} onClick={() => setActive(index)}><span className={`h-1.5 w-1.5 rounded-full ${active === index ? "bg-accent" : "bg-midnight-foreground/50"}`} /></Button>)}
        <Button variant="ghost" size="icon" className="studio-control h-8 w-8" aria-label="Next studio" title="Next studio" onClick={() => setActive(nextStudioSlide(active, STUDIOS.length))}><ChevronRight className="h-4 w-4" /></Button>
        {!reducedMotion && <Button variant="ghost" size="icon" className="studio-control h-8 w-8" aria-label={paused ? "Play backgrounds" : "Pause backgrounds"} title={paused ? "Play backgrounds" : "Pause backgrounds"} onClick={() => setPaused(!paused)}>{paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</Button>}
      </div>
    </>
  );
}