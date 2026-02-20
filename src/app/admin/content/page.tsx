'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { formatBDT } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
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

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');

  // Service dialog state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: 'ORTHOPEDIC',
    isActive: true,
  });

  // Blog dialog state
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    isPublished: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role && !['SUPER_ADMIN', 'CLINIC_MANAGER'].includes(session.user.role)) {
      router.push('/admin');
      return;
    }

    fetchContent();
  }, [session, status, router]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [servicesRes, blogsRes, galleryRes] = await Promise.all([
        fetch('/api/admin/content/services'),
        fetch('/api/admin/content/blogs'),
        fetch('/api/admin/content/gallery'),
      ]);

      if (servicesRes.ok) setServices(await servicesRes.json());
      if (blogsRes.ok) setBlogs(await blogsRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editMode 
        ? `/api/admin/content/services/${selectedService?.id}` 
        : '/api/admin/content/services';
      const method = editMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          duration: parseInt(serviceForm.duration),
          price: parseFloat(serviceForm.price),
        }),
      });

      if (response.ok) {
        toast.success(editMode ? 'Service updated successfully' : 'Service created successfully');
        setServiceDialogOpen(false);
        resetServiceForm();
        fetchContent();
      } else {
        toast.error('Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('An error occurred');
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditMode(true);
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      isActive: service.isActive,
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Service deleted successfully');
        fetchContent();
      } else {
        toast.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('An error occurred');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      duration: '',
      price: '',
      category: 'ORTHOPEDIC',
      isActive: true,
    });
    setEditMode(false);
    setSelectedService(null);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/content/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm),
      });

      if (response.ok) {
        toast.success('Blog post created successfully');
        setBlogDialogOpen(false);
        setBlogForm({
          title: '',
          excerpt: '',
          content: '',
          category: '',
          tags: '',
          isPublished: false,
        });
        fetchContent();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('An error occurred');
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      isPublished: false,
    });
  };

  if (loading) {
    return <ContentPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">
            Manage services, blog posts, and gallery
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Manage clinic services and pricing</CardDescription>
                </div>
                <Dialog open={serviceDialogOpen} onOpenChange={(open) => {
                  setServiceDialogOpen(open);
                  if (!open) resetServiceForm();
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditMode(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                      <DialogDescription>
                        {editMode ? 'Update service information' : 'Add a new service to the clinic'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleServiceSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input
                            id="serviceName"
                            value={serviceForm.name}
                            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            rows={3}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="15"
                              step="15"
                              value={serviceForm.duration}
                              onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="price">Price (BDT)</Label>
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={serviceForm.price}
                              onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={serviceForm.category}
                            onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ORTHOPEDIC">Orthopedic</SelectItem>
                              <SelectItem value="NEUROLOGICAL">Neurological</SelectItem>
                              <SelectItem value="SPORTS">Sports Injury</SelectItem>
                              <SelectItem value="PEDIATRIC">Pediatric</SelectItem>
                              <SelectItem value="CARDIOPULMONARY">Cardiopulmonary</SelectItem>
                              <SelectItem value="GERIATRIC">Geriatric</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editMode ? 'Update' : 'Create Service'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No services found</p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">Duration: {service.duration} min</span>
                          <span className="font-semibold">{formatBDT(service.price)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditService(service)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteService(service.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blogs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>Manage blog content and articles</CardDescription>
                </div>
                <Dialog open={blogDialogOpen} onOpenChange={(open) => {
                  setBlogDialogOpen(open);
                  if (!open) resetBlogForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Blog Post</DialogTitle>
                      <DialogDescription>
                        Write and publish a new blog post
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBlogSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="blogTitle">Title *</Label>
                          <Input
                            id="blogTitle"
                            value={blogForm.title}
                            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                            placeholder="Enter blog post title"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="blogExcerpt">Excerpt</Label>
                          <Textarea
                            id="blogExcerpt"
                            value={blogForm.excerpt}
                            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                            rows={2}
                            placeholder="Brief summary of the post"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="blogContent">Content *</Label>
                          <Textarea
                            id="blogContent"
                            value={blogForm.content}
                            onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
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
                              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                              placeholder="e.g., Health Tips"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="blogTags">Tags</Label>
                            <Input
                              id="blogTags"
                              value={blogForm.tags}
                              onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                              placeholder="e.g., physiotherapy, wellness (comma-separated)"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="blogPublished"
                            checked={blogForm.isPublished}
                            onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                            className="h-4 w-4"
                            aria-label="Publish immediately"
                          />
                          <Label htmlFor="blogPublished" className="cursor-pointer">
                            Publish immediately
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Post</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {blogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No blog posts found</p>
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
                          <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
                            {blog.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{blog.excerpt}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>By {blog.author?.name || 'Unknown'}</span>
                          <span>Created {format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>
                          {blog.publishedAt && (
                            <span>Published {format(new Date(blog.publishedAt), 'MMM dd, yyyy')}</span>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>Manage clinic images and media</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {gallery.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images in gallery</p>
                  <Button className="mt-4">
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
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-background">
                        <p className="font-medium text-sm truncate">{item.title}</p>
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
      <Skeleton className="h-10 w-[400px]" />
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
