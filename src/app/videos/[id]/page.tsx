"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Clock,
  Share2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  bodyParts: string[];
  featured: boolean;
  videoUrl?: string;
  detailedInstructions?: string;
  relatedVideos?: ExerciseVideo[];
}

const SAMPLE_VIDEO_DETAIL: ExerciseVideo = {
  id: "1",
  title: "Lower Back Pain Relief - 10 Minutes",
  description: "Gentle exercises to ease lower back pain and improve mobility.",
  thumbnail: "/images/video-thumbnail-1.jpg",
  duration: "10:30",
  difficulty: "Beginner",
  category: "Back Pain",
  bodyParts: ["Back", "Lower Back"],
  featured: true,
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  detailedInstructions: `
    <h3 class="font-bold mb-2">Step-by-Step Instructions:</h3>
    <ol class="list-decimal list-inside space-y-2">
      <li><strong>Cat-Cow Stretch (30 seconds):</strong> Start on your hands and knees. Alternate between arching your back (cow) and rounding it (cat). Repeat 10 times.</li>
      <li><strong>Child's Pose (1 minute):</strong> Sit back on your heels with your arms extended in front. Breathe deeply and relax into the position.</li>
      <li><strong>Pelvic Tilts (1 minute):</strong> Lie on your back with knees bent. Press your lower back to the floor by tilting your pelvis. Hold for 2 seconds and release. Repeat 15 times.</li>
      <li><strong>Knees to Chest (1 minute):</strong> Lying on your back, gently pull one knee toward your chest. Hold for 15 seconds and switch sides. Repeat 3 times per leg.</li>
      <li><strong>Bridge Pose (1 minute):</strong> Lie on your back with knees bent. Lift your hips toward the ceiling, creating a straight line from knees to shoulders. Hold for 2 seconds and lower. Repeat 10 times.</li>
      <li><strong>Quad Stretch (1 minute):</strong> Lie on your side and gently pull your top foot toward your buttocks. Hold for 20 seconds and switch sides. Repeat 2 times per leg.</li>
    </ol>
    <p class="mt-4"><strong>Important Notes:</strong></p>
    <ul class="list-disc list-inside space-y-1">
      <li>Perform this routine 3-4 times per week for optimal results.</li>
      <li>If you experience sharp pain, stop immediately and consult your physiotherapist.</li>
      <li>Breathe steadily throughout all exercises.</li>
      <li>Move slowly and maintain control.</li>
    </ul>
  `,
  relatedVideos: [
    {
      id: "3",
      title: "Core Strengthening Exercises",
      description: "Build a stronger core with these targeted exercises.",
      thumbnail: "/images/video-thumbnail-3.jpg",
      duration: "15:45",
      difficulty: "Intermediate",
      category: "Strength & Conditioning",
      bodyParts: ["Core", "Back"],
      featured: false,
    },
    {
      id: "4",
      title: "Posture Correction Routine",
      description: "Improve your posture with this guided routine.",
      thumbnail: "/images/video-thumbnail-4.jpg",
      duration: "12:00",
      difficulty: "Beginner",
      category: "Posture",
      bodyParts: ["Back", "Neck", "Shoulder"],
      featured: false,
    },
  ],
};

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

function getEmbeddableVideoUrl(url?: string) {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return url;
    }

    return url;
  } catch {
    return url;
  }
}

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<ExerciseVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedInstructions, setExpandedInstructions] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/content/videos/${videoId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch video");
        }

        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error("Error fetching video:", error);
        toast.error("Failed to load video details");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading video...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Video not found.</p>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors" />
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Video Player Section */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {video.videoUrl ? (
              <iframe
                src={getEmbeddableVideoUrl(video.videoUrl)}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">
                  Video player would be here
                </p>
              </div>
            )}
          </div>

          {/* Video Meta Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {video.category && (
                <Badge variant="outline" className="text-base">
                  {video.category}
                </Badge>
              )}
              <Badge
                className={`text-base ${DIFFICULTY_COLORS[video.difficulty]}`}
              >
                {video.difficulty}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground ml-auto">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold">{video.title}</h1>

            <p className="text-lg text-muted-foreground">{video.description}</p>

            {video.bodyParts && (
              <div className="text-sm">
                <span className="font-semibold">Focuses on:</span>{" "}
                <span className="text-muted-foreground">
                  {video.bodyParts.join(", ")}
                </span>
              </div>
            )}

            {/* Share Button */}
            <div className="pt-4 border-t">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Video
              </Button>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  Important Safety Disclaimer
                </h3>
                <p className="text-sm text-red-800">
                  These exercises are for general information and educational
                  purposes only. Always consult with a qualified physiotherapist
                  or healthcare professional before beginning any new exercise
                  program to ensure it is appropriate for your individual needs.
                  Stop immediately if you experience any pain or discomfort. If
                  you have any medical conditions or are taking medications,
                  please inform your healthcare provider.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Instructions */}
          {video.detailedInstructions && (
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedInstructions(!expandedInstructions)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle>Detailed Instructions</CardTitle>
                  {expandedInstructions ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </CardHeader>
              {expandedInstructions && (
                <CardContent className="space-y-4">
                  <div
                    className="prose prose-sm max-w-none
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                      prose-li:marker:text-primary"
                    dangerouslySetInnerHTML={{
                      __html: video.detailedInstructions,
                    }}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Related Videos */}
          {video.relatedVideos && video.relatedVideos.length > 0 && (
            <div className="space-y-6">
              <Separator />
              <div>
                <h2 className="text-2xl font-bold mb-6">Related Videos</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {video.relatedVideos.map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/videos/${relatedVideo.id}`}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <div className="relative aspect-video bg-muted">
                          <Image
                            src={relatedVideo.thumbnail}
                            alt={relatedVideo.title}
                            fill
                            className="object-cover hover:brightness-75 transition-all"
                          />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold line-clamp-2">
                            {relatedVideo.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {relatedVideo.duration}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {relatedVideo.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <Card className="bg-primary/5">
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Need Personalized Help?</h3>
                <p className="text-muted-foreground">
                  If you need guidance tailored to your specific condition, our
                  expert physiotherapists are here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/book">
                    <Button size="lg">Book Appointment</Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
