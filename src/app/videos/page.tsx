"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Search, Filter, Clock, Award, X } from "lucide-react";
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
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

const SAMPLE_VIDEOS: ExerciseVideo[] = [
  {
    id: "1",
    title: "Lower Back Pain Relief - 10 Minutes",
    description:
      "Gentle exercises to ease lower back pain and improve mobility.",
    thumbnail: "/images/video-thumbnail-1.jpg",
    duration: "10:30",
    difficulty: "Beginner",
    category: "Back Pain",
    bodyParts: ["Back", "Lower Back"],
    featured: true,
  },
  {
    id: "2",
    title: "Neck and Shoulder Stretches",
    description: "Effective stretches for neck tension and shoulder stiffness.",
    thumbnail: "/images/video-thumbnail-2.jpg",
    duration: "8:15",
    difficulty: "Beginner",
    category: "Neck & Shoulder",
    bodyParts: ["Neck", "Shoulder"],
    featured: true,
  },
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
  {
    id: "5",
    title: "Knee Rehabilitation - Phase 1",
    description: "Initial phase knee rehabilitation exercises post-injury.",
    thumbnail: "/images/video-thumbnail-5.jpg",
    duration: "14:20",
    difficulty: "Intermediate",
    category: "Knee Rehabilitation",
    bodyParts: ["Knee"],
    featured: false,
  },
  {
    id: "6",
    title: "Balance Training for Fall Prevention",
    description: "Improve balance and prevent falls with these exercises.",
    thumbnail: "/images/video-thumbnail-6.jpg",
    duration: "11:30",
    difficulty: "Intermediate",
    category: "Balance & Falls Prevention",
    bodyParts: ["Balance"],
    featured: false,
  },
];

const CATEGORIES = [
  "All",
  "Back Pain",
  "Neck & Shoulder",
  "Knee Rehabilitation",
  "Posture",
  "Strength & Conditioning",
  "Balance & Falls Prevention",
];

const BODY_PARTS = [
  "All",
  "Neck",
  "Shoulder",
  "Back",
  "Lower Back",
  "Hip",
  "Knee",
  "Ankle",
  "Core",
];

export default function VideosPage() {
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedBodyPart, setSelectedBodyPart] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [filteredVideos, setFilteredVideos] = useState<ExerciseVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/content/videos");

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();
        setVideos(data);
        setFilteredVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const filterVideos = () => {
      let result = videos;

      // Search filter
      if (searchQuery) {
        result = result.filter(
          (video) =>
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Category filter
      if (selectedCategory !== "All") {
        result = result.filter((video) => video.category === selectedCategory);
      }

      // Difficulty filter
      if (selectedDifficulty !== "All") {
        result = result.filter(
          (video) => video.difficulty === selectedDifficulty,
        );
      }

      // Body part filter
      if (selectedBodyPart !== "All") {
        result = result.filter((video) =>
          video.bodyParts.includes(selectedBodyPart),
        );
      }

      // Sorting
      if (sortBy === "title") {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === "duration") {
        result.sort((a, b) => {
          const aDuration = parseInt(a.duration.split(":")[0]);
          const bDuration = parseInt(b.duration.split(":")[0]);
          return aDuration - bDuration;
        });
      }
      // "recent" is default, no sorting needed

      setFilteredVideos(result);
    };

    filterVideos();
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedBodyPart,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setSelectedBodyPart("All");
    setSortBy("recent");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedDifficulty !== "All" ||
    selectedBodyPart !== "All";

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors" />
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Exercise & Wellness
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exercise Video Library
            </h1>
            <p className="text-lg opacity-90">
              Explore our collection of video tutorials designed by our expert
              physiotherapists to support your recovery and enhance your
              well-being. Please consult with your physiotherapist before
              starting any new exercise program.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search exercises (e.g., 'neck pain', 'knee rehab')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 p-6 bg-white rounded-lg border">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Filters & Sorting</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Body Part Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Body Part</label>
              <Select
                value={selectedBodyPart}
                onValueChange={setSelectedBodyPart}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="duration">Duration (Shortest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing <span className="font-semibold">{filteredVideos.length}</span>{" "}
          of <span className="font-semibold">{videos.length}</span> videos
          {searchQuery && ` for "${searchQuery}"`}
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredVideos.map((video) => (
              <Link key={video.id} href={`/videos/${video.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted group">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:brightness-75 transition-all"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>

                    {/* Featured Badge */}
                    {video.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                        Featured
                      </Badge>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2 text-sm md:text-base">
                      {video.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>

                    {/* Category Badge */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {video.category}
                      </Badge>
                      <Badge
                        className={`text-xs ${DIFFICULTY_COLORS[video.difficulty]}`}
                      >
                        {video.difficulty}
                      </Badge>
                    </div>

                    {/* Body Parts */}
                    {video.bodyParts.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Focuses: {video.bodyParts.join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No videos found matching your criteria.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12 bg-primary/5 rounded-2xl p-8">
          <h2 className="text-3xl font-bold">Need Personalized Guidance?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            For exercises tailored to your specific condition, book a
            consultation with our expert physiotherapists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg">Book Appointment</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
