import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Eye, BookOpen, Grid, List, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useBooks, useAddBook, useDeleteBook, Book, useUpdateBook } from '@/hooks/useBooks';
import { useBorrowBook } from '@/hooks/useTransactions';

const categories = ['All', 'Fiction', 'Science', 'History', 'Technology', 'Arts'];

import { useAuth } from '@/contexts/AuthContext';

export default function Books() {
  const { data: books = [], isLoading } = useBooks();
  const { user } = useAuth();
  const addBookMutation = useAddBook();
  const deleteBookMutation = useDeleteBook();
  const borrowBookMutation = useBorrowBook();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const coverFile = (formData.get('cover') as File);

    // Simple validation could go here, or handled by HTML required attrs

    addBookMutation.mutate({
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      isbn: formData.get('isbn') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      coverImage: coverFile.size > 0 ? coverFile : undefined,
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        // Toast handled by hook
      }
    });
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBookMutation.mutate(id);
    }
  };

  const handleBorrowBook = (bookId: string) => {
    if (confirm('Do you want to borrow this book?')) {
      borrowBookMutation.mutate(bookId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Books</h1>
            <p className="text-muted-foreground mt-1">Manage your library collection</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Enter the details of the new book below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Enter book title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" name="author" placeholder="Enter author name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" name="isbn" placeholder="ISBN-13" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'All').map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover">Cover Image</Label>
                    <Input
                      id="cover"
                      name="cover"
                      type="file"
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addBookMutation.isPending}>
                    {addBookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Book
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card-hover overflow-hidden group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                      <Button size="sm" className="flex-1 gap-1" onClick={() => {
                        setSelectedBook(book);
                        setIsViewDialogOpen(true);
                      }}>
                        <Eye className="w-3 h-3" />
                        View
                      </Button>

                      {/* Borrow Button: Show if NOT owner AND available */}
                      {user?.id !== book.owner_id && book.available > 0 && (
                        <Button size="sm" className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleBorrowBook(book.id)}>
                          <BookOpen className="w-3 h-3" />
                          Borrow
                        </Button>
                      )}

                      {/* Edit/Delete Buttons: Show ONLY if owner */}
                      {user?.id === book.owner_id && (
                        <>
                          <Button size="sm" variant="secondary" className="gap-1" onClick={() => {
                            setSelectedBook(book);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground truncate">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {book.category}
                      </span>
                      <span className={`text-sm font-medium ${book.available > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {book.available}/{book.quantity} available
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-display font-semibold text-foreground">Book</th>
                      <th className="text-left p-4 font-display font-semibold text-foreground">ISBN</th>
                      <th className="text-left p-4 font-display font-semibold text-foreground">Category</th>
                      <th className="text-left p-4 font-display font-semibold text-foreground">Availability</th>
                      <th className="text-right p-4 font-display font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book, index) => (
                      <motion.tr
                        key={book.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-foreground">{book.title}</p>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-sm">{book.isbn}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                            {book.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-medium ${book.available > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {book.available}/{book.quantity}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredBooks.length === 0 && (
          <div className="glass-card p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground">No books found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>


      {/* View Book Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
            <DialogDescription>Full information about the selected book.</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20">
                <img src={selectedBook.cover_url} alt={selectedBook.title} className="w-full h-full object-cover" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-display font-bold">{selectedBook.title}</h3>
                  <p className="text-lg text-muted-foreground">{selectedBook.author}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                    <p>{selectedBook.category}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">ISBN</h4>
                    <p className="font-mono">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Availability</h4>
                    <p className={selectedBook.available > 0 ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
                      {selectedBook.available} / {selectedBook.quantity} Available
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border flex justify-end gap-3">
                  {user?.id !== selectedBook.owner_id && selectedBook.available > 0 && (
                    <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      handleBorrowBook(selectedBook.id);
                      setIsViewDialogOpen(false);
                    }}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Borrow Book
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          {/* Reuse the Add form logic or create a new Edit form. For brevity using a similar structure */}
          {/* Note: In a real app, I'd extract the form to a component to reuse it. */}
          {selectedBook && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Editing functionality would use the <code>useUpdateBook</code> mutation.</p>
              <Button className="mt-4" onClick={() => setIsEditDialogOpen(false)}>Close (Placeholder)</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </MainLayout >
  );
}
