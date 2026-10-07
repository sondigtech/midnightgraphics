import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { ErrorState, Spinner } from "@/components/site/states";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/brand";
import { tutorialPriceQuery, tutorialsQuery } from "@/lib/tutorials";

export const Route = createFileRoute("/tutorials/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Watch Tutorial | Midnight Graphics Enterprises" },
      { name: "description", content: "Watch a Midnight Graphics design tutorial." },
      { property: "og:title", content: "Watch Tutorial | Midnight Graphics" },
      { property: "og:description", content: "Free preview, full lesson for enrolled students." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Watch,
});

function Watch() {
  const { id } = Route.useParams();
  const list = useQuery(tutorialsQuery);
  const price = useQuery(tutorialPriceQuery);
  const video = useQuery({
    queryKey: ["tutorial-video", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_tutorial_video", { _id: id });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  const ref = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const t = list.data?.find((x) => x.id === id);
  const limit = Math.min(video.data?.preview_seconds ?? 59, 59);

  const onTime = () => {
    const v = ref.current;
    if (!v || video.data?.full_access) return;
    if (v.currentTime >= limit) { v.pause(); v.currentTime = limit; setEnded(true); }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/tutorials" className="text-sm text-muted-foreground hover:text-foreground">← All tutorials</Link>
        {video.isLoading ? <div className="py-20"><Spinner /></div> : video.error || !video.data ? <ErrorState /> : (
          <>
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-foreground">
              {video.data.video_url ? (
                <video ref={ref} src={video.data.video_url} controls={!ended} controlsList="nodownload" playsInline
                  onTimeUpdate={onTime} onSeeked={onTime} onContextMenu={(e) => e.preventDefault()} className="aspect-video w-full" />
              ) : <div className="flex aspect-video items-center justify-center text-background">Video coming soon</div>}
              {ended && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/90 p-6 text-center text-background">
                  <Lock className="h-10 w-10" />
                  <p className="text-xl font-bold">Preview ended / Muda wa majaribio umeisha</p>
                  <p className="text-sm opacity-80">Enroll to continue watching: {formatMoney(price.data?.price ?? 50000)} / month</p>
                  <Button asChild size="lg"><Link to="/dashboard">Enroll now</Link></Button>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-2">
              <h1 className="text-2xl font-bold">{t?.title}</h1>
              {t?.description && <p className="text-muted-foreground">{t.description}</p>}
              {!video.data.full_access && (
                <p className="rounded-lg border border-border bg-card p-3 text-sm">
                  You're watching a free preview ({limit}s). <Link to="/dashboard" className="font-semibold text-accent">Enroll for {formatMoney(price.data?.price ?? 50000)}/month</Link> to watch the full tutorial.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}
