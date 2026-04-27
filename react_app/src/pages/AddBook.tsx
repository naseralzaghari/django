import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_BOOK, GET_AVAILABLE_BOOKS } from '../apollo/queries';
import { graphqlFileUpload } from '../config/api';
import './AdminPages.css';

const AddBook: React.FC = () => {
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

  const [createBook, { loading },] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: GET_AVAILABLE_BOOKS }],
    onCompleted: (data: any) => {
      if (data.createBook.success) {
        setSuccess('Book added successfully!');
        setFormData({
          title: '',
          author: '',
          isbn: '',
          description: '',
          category: '',
          totalCopies: 1,
          availableCopies: 1,
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.createBook.message);
      }
    },
    onError: (err: any) => {
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
      const query = `
        mutation CreateBook(
          $title: String!
          $author: String!
          $isbn: String!
          $description: String
          $category: String
          $totalCopies: Int!
          $availableCopies: Int!
          $pdfFile: String
        ) {
          createBook(
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
      
      try {
        const result = await graphqlFileUpload(
          query,
          { ...formData, pdfFile: 'pdf_file' },
          { pdf_file: pdfFile }
        );
        
        if (result.data?.createBook?.success) {
          setSuccess('Book added successfully with PDF!');
          setFormData({
            title: '',
            author: '',
            isbn: '',
            description: '',
            category: '',
            totalCopies: 1,
            availableCopies: 1,
          });
          setPdfFile(null);
          // Reset file input
          const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(result.data?.createBook?.message || result.errors?.[0]?.message || 'Error creating book');
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      }
    } else {
      // No PDF file, use regular mutation
      await createBook({ variables: formData });
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

  return (
    <div className="admin-page">
      <h1>Add New Book</h1>
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
            <input
              id="pdfFile"
              name="pdfFile"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
            {pdfFile && (
              <small style={{ color: '#10b981', marginTop: '4px', display: 'block' }}>
                Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </small>
            )}
          </div>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding Book...' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
