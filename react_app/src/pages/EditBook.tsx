import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, useNavigate } from 'react-router-dom';
import { GET_BOOK, UPDATE_BOOK, DELETE_BOOK, GET_AVAILABLE_BOOKS } from '../apollo/queries';
import { Book } from '../types';
import './AdminPages.css';

const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentPdf, setCurrentPdf] = useState<{hasPdf: boolean, pdfUrl?: string, pdfDownloadUrl?: string} | null>(null);

  // Fetch book data
  const { data, loading: loadingBook, error: loadError } = useQuery<{ book: Book }>(GET_BOOK, {
    variables: { id: parseInt(id || '0') },
    skip: !id,
  });

  // Update form when data loads
  useEffect(() => {
    if (data?.book) {
      setFormData({
        title: data.book.title || '',
        author: data.book.author || '',
        isbn: data.book.isbn || '',
        description: data.book.description || '',
        category: data.book.category || '',
        totalCopies: data.book.totalCopies || 1,
        availableCopies: data.book.availableCopies || 1,
      });
      setCurrentPdf({
        hasPdf: data.book.hasPdf,
        pdfUrl: data.book.pdfUrl,
        pdfDownloadUrl: data.book.pdfDownloadUrl
      });
    }
  }, [data]);

  // Show error if query fails
  useEffect(() => {
    if (loadError) {
      setError(`Error loading book: ${loadError.message}`);
    }
  }, [loadError]);

  const [updateBook, { loading: updating }] = useMutation<{
    updateBook: { success: boolean; message: string; book?: { id: string; title: string } };
  }>(UPDATE_BOOK, {
    refetchQueries: [{ query: GET_AVAILABLE_BOOKS }],
    onCompleted: (data) => {
      if (data.updateBook.success) {
        setSuccess('Book updated successfully!');
        setTimeout(() => {
          navigate('/books');
        }, 1500);
      } else {
        setError(data.updateBook.message);
      }
    },
    onError: (err) => {
      setError(`Error: ${err.message}`);
    },
  });

  const [deleteBook, { loading: deleting }] = useMutation<{
    deleteBook: { success: boolean; message: string };
  }>(DELETE_BOOK, {
    refetchQueries: [{ query: GET_AVAILABLE_BOOKS }],
    onCompleted: (data) => {
      if (data.deleteBook.success) {
        setSuccess('Book deleted successfully!');
        setTimeout(() => {
          navigate('/books');
        }, 1500);
      } else {
        setError(data.deleteBook.message);
      }
    },
    onError: (err) => {
      setError(`Error: ${err.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate ISBN length (must be exactly 13 digits)
    if (formData.isbn.length !== 13) {
      setError('ISBN must be exactly 13 digits');
      return;
    }
    
    // Validate PDF file size if provided (100MB limit)
    if (pdfFile && pdfFile.size > 100 * 1024 * 1024) {
      setError('PDF file size must be less than 100MB');
      return;
    }

    // If there's a PDF file, use multipart form-data with fetch
    if (pdfFile) {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      const query = `
        mutation UpdateBook(
          $id: Int!
          $title: String
          $author: String
          $isbn: String
          $description: String
          $category: String
          $totalCopies: Int
          $availableCopies: Int
          $pdfFile: String
        ) {
          updateBook(
            id: $id
            title: $title
            author: $author
            isbn: $isbn
            description: $description
            category: $category
            totalCopies: $totalCopies
            availableCopies: $availableCopies
            pdfFile: $pdfFile
          ) {
            success
            message
            book {
              id
              title
            }
          }
        }
      `;
      
      formDataToSend.append('query', query);
      formDataToSend.append('variables', JSON.stringify({
        id: parseInt(id || '0'),
        ...formData,
        pdfFile: 'pdf_file'
      }));
      formDataToSend.append('pdf_file', pdfFile);
      
      try {
        const response = await fetch('http://localhost:8000/graphql/', {
          method: 'POST',
          headers: {
            'Authorization': `JWT ${token}`
          },
          body: formDataToSend
        });
        
        const result = await response.json();
        
        if (result.data?.updateBook?.success) {
          setSuccess('Book updated successfully with PDF!');
          setTimeout(() => {
            navigate('/books');
          }, 1500);
        } else {
          setError(result.data?.updateBook?.message || result.errors?.[0]?.message || 'Error updating book');
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      }
    } else {
      // No PDF file, use regular mutation
      await updateBook({ 
        variables: {
          id: parseInt(id || '0'),
          ...formData 
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalCopies' || name === 'availableCopies' ? parseInt(value) : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        e.target.value = '';
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError('PDF file size must be less than 100MB');
        e.target.value = '';
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      await deleteBook({ variables: { id: parseInt(id || '0') } });
    }
  };

  if (loadingBook) return <div className="loading">Loading book...</div>;
  if (!data?.book) return <div className="error">Book not found</div>;

  return (
    <div className="admin-page">
      <h1>Edit Book</h1>
      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter book title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Enter author name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              value={formData.isbn}
              onChange={handleChange}
              required
              placeholder="13-digit ISBN"
              maxLength={13}
              pattern="[0-9]{13}"
              title="ISBN must be exactly 13 digits"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              {formData.isbn.length}/13 digits
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Fiction, Science, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the book"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalCopies">Total Copies *</label>
              <input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="availableCopies">Available Copies *</label>
              <input
                id="availableCopies"
                name="availableCopies"
                type="number"
                min="0"
                value={formData.availableCopies}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">Book PDF (Optional, max 100MB)</label>
            {currentPdf?.hasPdf && (
              <div style={{ marginBottom: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '4px' }}>
                <small style={{ color: '#059669' }}>
                  ✓ Current PDF attached
                </small>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => window.open(currentPdf.pdfUrl, '_blank')}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    className="btn-secondary"
                  >
                    View Current PDF
                  </button>
                </div>
              </div>
            )}
            <input
              id="pdfFile"
              name="pdfFile"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
            {pdfFile && (
              <small style={{ color: '#10b981', marginTop: '4px', display: 'block' }}>
                New PDF selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </small>
            )}
            {!currentPdf?.hasPdf && !pdfFile && (
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                No PDF currently attached
              </small>
            )}
          </div>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              disabled={updating || deleting} 
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {updating ? 'Updating...' : 'Update Book'}
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={updating || deleting}
              className="btn-danger"
              style={{ flex: 1 }}
            >
              {deleting ? 'Deleting...' : 'Delete Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
