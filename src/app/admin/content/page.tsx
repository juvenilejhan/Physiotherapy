"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ImageUpload } from "@/components/ui/image-upload";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  bodyParts: string[];
  videoUrl: string;
  featured: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author?: {
    name: string;
  };
  authorId: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");

  // Video dialog state
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoEditMode, setVideoEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(
    null,
  );
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    duration: "",
    difficulty: "Beginner" as const,
    category: "",
    bodyParts: "",
    videoUrl: "",
    featured: false,
  });

  // Blog dialog state
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [blogEditMode, setBlogEditMode] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    isPublished: false,
    featuredImage: "",
  });

  // Gallery dialog state
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [galleryEditMode, setGalleryEditMode] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] =
    useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "GENERAL",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER"].includes(session.user.role)
    ) {
      router.push("/admin");
      return;
    }

    fetchContent();
  }, [session, status, router]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [videosRes, blogsRes, galleryRes] = await Promise.all([
        fetch("/api/admin/content/videos"),
        fetch("/api/admin/content/blogs"),
        fetch("/api/admin/content/gallery"),
      ]);

      if (videosRes.ok) {
        setVideos(await videosRes.json());
      } else {
        const error = await videosRes.json();
        console.error("Error fetching videos:", error);
      }

      if (blogsRes.ok) {
        setBlogs(await blogsRes.json());
      } else {
        const error = await blogsRes.json();
        console.error("Error fetching blogs:", error);
      }

      if (galleryRes.ok) {
        setGallery(await galleryRes.json());
      } else {
        const error = await galleryRes.json();
        console.error("Error fetching gallery:", error);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (videoEditMode && !selectedVideo?.id) {
        toast.error(
          "Video ID is missing. Please select a video to edit again.",
        );
        return;
      }

      const url = videoEditMode
        ? `/api/admin/content/videos/${selectedVideo?.id}`
        : "/api/admin/content/videos";
      const method = videoEditMode ? "PATCH" : "POST";

      const bodyParts = videoForm.bodyParts
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...videoForm,
          bodyParts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          videoEditMode
            ? "Video updated successfully"
            : "Video created successfully",
        );
        setVideoDialogOpen(false);
        resetVideoForm();
        fetchContent();
      } else {
        const errorMessage = data.error || "Failed to save video";
        console.error("API Error:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("An error occurred");
    }
  };

  const handleEditVideo = (video: ExerciseVideo) => {
    setSelectedVideo(video);
    setVideoEditMode(true);
    setVideoForm({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
      difficulty: video.difficulty,
      category: video.category,
      bodyParts: video.bodyParts.join(", "),
      videoUrl: video.videoUrl,
      featured: video.featured,
    });
    setVideoDialogOpen(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/videos/${videoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Video deleted successfully");
        fetchContent();
      } else {
        toast.error("Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("An error occurred");
    }
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      description: "",
      thumbnail: "",
      duration: "",
      difficulty: "Beginner",
      category: "",
      bodyParts: "",
      videoUrl: "",
      featured: false,
    });
    setVideoEditMode(false);
    setSelectedVideo(null);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = blogEditMode
        ? `/api/admin/content/blogs/${selectedBlog?.id}`
        : "/api/admin/content/blogs";
      const method = blogEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogForm),
      });

      if (response.ok) {
        toast.success(
          blogEditMode
            ? "Blog post updated successfully"
            : "Blog post created successfully",
        );
        setBlogDialogOpen(false);
        resetBlogForm();
        fetchContent();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save blog post");
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error("An error occurred");
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setBlogEditMode(true);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      category: "",
      tags: "",
      isPublished: blog.isPublished,
      featuredImage: blog.featuredImage || "",
    });
    setBlogDialogOpen(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/blogs/${blogId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Blog post deleted successfully");
        fetchContent();
      } else {
        toast.error("Failed to delete blog post");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("An error occurred");
    }
  };

  const handleTogglePublish = async (blog: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/content/blogs/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
      });

      if (response.ok) {
        toast.success(
          blog.isPublished ? "Blog post unpublished" : "Blog post published",
        );
        fetchContent();
      } else {
        toast.error("Failed to update blog post");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("An error occurred");
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      isPublished: false,
      featuredImage: "",
    });
    setBlogEditMode(false);
    setSelectedBlog(null);
  };

  // Gallery handlers
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = galleryEditMode
        ? `/api/admin/content/gallery/${selectedGalleryItem?.id}`
        : "/api/admin/content/gallery";
      const method = galleryEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galleryForm),
      });

      if (response.ok) {
        toast.success(
          galleryEditMode
            ? "Gallery item updated successfully"
            : "Gallery item added successfully",
        );
        setGalleryDialogOpen(false);
        resetGalleryForm();
        fetchContent();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save gallery item");
      }
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error("An error occurred");
    }
  };

  const handleEditGallery = (item: GalleryItem) => {
    setSelectedGalleryItem(item);
    setGalleryEditMode(true);
    setGalleryForm({
      title: item.title || "",
      description: item.description || "",
      url: item.url,
      category: item.category || "GENERAL",
    });
    setGalleryDialogOpen(true);
  };

  const handleDeleteGallery = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/gallery/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Gallery item deleted successfully");
        fetchContent();
      } else {
        toast.error("Failed to delete gallery item");
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("An error occurred");
    }
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: "",
      description: "",
      url: "",
      category: "GENERAL",
    });
    setGalleryEditMode(false);
    setSelectedGalleryItem(null);
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return <ContentPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Content Management
          </h2>
          <p className="text-muted-foreground">
            Manage exercise videos, blog posts, and gallery
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="videos">Exercise Videos</TabsTrigger>
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* Exercise Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Exercise Videos</CardTitle>
                  <CardDescription>
                    Manage exercise videos and tutorials
                  </CardDescription>
                </div>
                <Dialog
                  open={videoDialogOpen}
                  onOpenChange={(open) => {
                    setVideoDialogOpen(open);
                    if (!open) resetVideoForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button onClick={resetVideoForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {videoEditMode ? "Edit Video" : "Add New Video"}
                      </DialogTitle>
                      <DialogDescription>
                        {videoEditMode
                          ? "Update video information"
                          : "Add a new exercise video"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVideoSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="videoTitle">Title *</Label>
                          <Input
                            id="videoTitle"
                            value={videoForm.title}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="e.g., Lower Back Pain Relief"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="videoDescription">
                            Description *
                          </Label>
                          <Textarea
                            id="videoDescription"
                            value={videoForm.description}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            placeholder="Brief description of the exercise"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="videoUrl">Video URL *</Label>
                          <Input
                            id="videoUrl"
                            value={videoForm.videoUrl}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                videoUrl: e.target.value,
                              })
                            }
                            placeholder="e.g., https://youtube.com/embed/..."
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Thumbnail Image</Label>
                          <ImageUpload
                            value={videoForm.thumbnail}
                            onChange={(url) =>
                              setVideoForm({
                                ...videoForm,
                                thumbnail: url,
                              })
                            }
                            folder="videos"
                            placeholder="Upload or paste thumbnail URL"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="duration">Duration *</Label>
                            <Input
                              id="duration"
                              value={videoForm.duration}
                              onChange={(e) =>
                                setVideoForm({
                                  ...videoForm,
                                  duration: e.target.value,
                                })
                              }
                              placeholder="e.g., 10:30"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="difficulty">Difficulty *</Label>
                            <Select
                              value={videoForm.difficulty}
                              onValueChange={(value) =>
                                setVideoForm({
                                  ...videoForm,
                                  difficulty: value as
                                    | "Beginner"
                                    | "Intermediate"
                                    | "Advanced",
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">
                                  Beginner
                                </SelectItem>
                                <SelectItem value="Intermediate">
                                  Intermediate
                                </SelectItem>
                                <SelectItem value="Advanced">
                                  Advanced
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category *</Label>
                          <Input
                            id="category"
                            value={videoForm.category}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                category: e.target.value,
                              })
                            }
                            placeholder="e.g., Back Pain, Neck & Shoulder"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="bodyParts">
                            Body Parts (comma-separated)
                          </Label>
                          <Input
                            id="bodyParts"
                            value={videoForm.bodyParts}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                bodyParts: e.target.value,
                              })
                            }
                            placeholder="e.g., Back, Lower Back, Spine"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="videoFeatured"
                            checked={videoForm.featured}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                featured: e.target.checked,
                              })
                            }
                            className="h-4 w-4"
                            aria-label="Featured video"
                          />
                          <Label
                            htmlFor="videoFeatured"
                            className="cursor-pointer"
                          >
                            Mark as featured
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {videoEditMode ? "Update Video" : "Create Video"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {filteredVideos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {videos.length === 0
                    ? "No exercise videos yet"
                    : "No videos match your search"}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        {video.thumbnail && (
                          <div className="flex-shrink-0">
                            <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="h-8 w-8 sm:h-6 sm:w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-2 mb-1">
                            <h3 className="font-semibold break-words">
                              {video.title}
                            </h3>
                            {video.featured && (
                              <Badge variant="default">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={DIFFICULTY_COLORS[video.difficulty]}
                            >
                              {video.difficulty}
                            </Badge>
                            <Badge variant="secondary">{video.category}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span>{video.duration}</span>
                            {video.bodyParts.length > 0 && (
                              <span className="truncate">
                                {video.bodyParts.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="self-end sm:self-start"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditVideo(video)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blogs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>
                    Manage blog content and articles
                  </CardDescription>
                </div>
                <Dialog
                  open={blogDialogOpen}
                  onOpenChange={(open) => {
                    setBlogDialogOpen(open);
                    if (!open) resetBlogForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setBlogEditMode(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {blogEditMode
                          ? "Edit Blog Post"
                          : "Create New Blog Post"}
                      </DialogTitle>
                      <DialogDescription>
                        {blogEditMode
                          ? "Update blog post content"
                          : "Write and publish a new blog post"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBlogSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="blogTitle">Title *</Label>
                          <Input
                            id="blogTitle"
                            value={blogForm.title}
                            onChange={(e) =>
                              setBlogForm({
                                ...blogForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="Enter blog post title"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="blogExcerpt">Excerpt</Label>
                          <Textarea
                            id="blogExcerpt"
                            value={blogForm.excerpt}
                            onChange={(e) =>
                              setBlogForm({
                                ...blogForm,
                                excerpt: e.target.value,
                              })
                            }
                            rows={2}
                            placeholder="Brief summary of the post"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="blogContent">Content *</Label>
                          <Textarea
                            id="blogContent"
                            value={blogForm.content}
                            onChange={(e) =>
                              setBlogForm({
                                ...blogForm,
                                content: e.target.value,
                              })
                            }
                            rows={10}
                            placeholder="Write your blog post content here..."
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="blogCategory">Category</Label>
                            <Input
                              id="blogCategory"
                              value={blogForm.category}
                              onChange={(e) =>
                                setBlogForm({
                                  ...blogForm,
                                  category: e.target.value,
                                })
                              }
                              placeholder="e.g., Health Tips"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="blogTags">Tags</Label>
                            <Input
                              id="blogTags"
                              value={blogForm.tags}
                              onChange={(e) =>
                                setBlogForm({
                                  ...blogForm,
                                  tags: e.target.value,
                                })
                              }
                              placeholder="e.g., physiotherapy, wellness (comma-separated)"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="blogPublished"
                            checked={blogForm.isPublished}
                            onChange={(e) =>
                              setBlogForm({
                                ...blogForm,
                                isPublished: e.target.checked,
                              })
                            }
                            className="h-4 w-4"
                            aria-label="Publish immediately"
                          />
                          <Label
                            htmlFor="blogPublished"
                            className="cursor-pointer"
                          >
                            Publish immediately
                          </Label>
                        </div>
                        <div className="grid gap-2">
                          <Label>Featured Image</Label>
                          <ImageUpload
                            value={blogForm.featuredImage}
                            onChange={(url) =>
                              setBlogForm({
                                ...blogForm,
                                featuredImage: url,
                              })
                            }
                            folder="blogs"
                            placeholder="Upload or paste featured image URL"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {blogEditMode ? "Update Post" : "Create Post"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {blogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No blog posts found
                </p>
              ) : (
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{blog.title}</h3>
                          <Badge
                            variant={blog.isPublished ? "default" : "secondary"}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>By {blog.author?.name || "Unknown"}</span>
                          <span>
                            Created{" "}
                            {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                          </span>
                          {blog.publishedAt && (
                            <span>
                              Published{" "}
                              {format(
                                new Date(blog.publishedAt),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditBlog(blog)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTogglePublish(blog)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {blog.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteBlog(blog.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>
                    Manage clinic images and media
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                  <Dialog
                    open={galleryDialogOpen}
                    onOpenChange={(open) => {
                      setGalleryDialogOpen(open);
                      if (!open) resetGalleryForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setGalleryEditMode(false)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {galleryEditMode
                            ? "Edit Gallery Item"
                            : "Add New Image"}
                        </DialogTitle>
                        <DialogDescription>
                          {galleryEditMode
                            ? "Update gallery item details"
                            : "Add a new image to the gallery"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleGallerySubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="galleryTitle">Title</Label>
                            <Input
                              id="galleryTitle"
                              value={galleryForm.title}
                              onChange={(e) =>
                                setGalleryForm({
                                  ...galleryForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Image title"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Image *</Label>
                            <ImageUpload
                              value={galleryForm.url}
                              onChange={(url) =>
                                setGalleryForm({
                                  ...galleryForm,
                                  url: url,
                                })
                              }
                              folder="gallery"
                              placeholder="Upload or paste image URL"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="galleryDescription">
                              Description
                            </Label>
                            <Textarea
                              id="galleryDescription"
                              value={galleryForm.description}
                              onChange={(e) =>
                                setGalleryForm({
                                  ...galleryForm,
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Optional description"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="galleryCategory">Category</Label>
                            <Select
                              value={galleryForm.category}
                              onValueChange={(value) =>
                                setGalleryForm({
                                  ...galleryForm,
                                  category: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GENERAL">General</SelectItem>
                                <SelectItem value="CLINIC">Clinic</SelectItem>
                                <SelectItem value="EQUIPMENT">
                                  Equipment
                                </SelectItem>
                                <SelectItem value="TEAM">Team</SelectItem>
                                <SelectItem value="TREATMENTS">
                                  Treatments
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {galleryEditMode ? "Update" : "Add Image"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {gallery.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images in gallery</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setGalleryEditMode(false);
                      setGalleryDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-lg overflow-hidden border bg-muted"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditGallery(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteGallery(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-background">
                        <p className="font-medium text-sm truncate">
                          {item.title}
                        </p>
                        {item.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-100" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
