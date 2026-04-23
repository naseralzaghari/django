import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_BOOK, GET_AVAILABLE_BOOKS } from '../apollo/queries';
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [createBook, { loading }] = useMutation(CREATE_BOOK, {
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
    await createBook({ variables: formData });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalCopies' || name === 'availableCopies' ? parseInt(value) : value,
    });
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
            />
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
