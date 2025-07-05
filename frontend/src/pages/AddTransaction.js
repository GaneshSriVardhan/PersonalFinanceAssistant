import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import { createTransaction } from '../services/api';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const AddTransaction = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/auth/getUser', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(response.data);
      } catch (error) {
        setError('Error fetching user: ' + error.message);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.includes('image') || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
    } else {
      setError('Please upload a PNG, PDF, or other image file.');
    }
  };

  const extractFromImage = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });
      console.log('Extracted Image Text:', text); // Debug logging
      return parseReceiptText(text); // Revert to original receipt parsing for images
    } catch (error) {
      throw new Error('Failed to process image: ' + error.message);
    }
  };

  const extractFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      console.log('Extracted PDF Text:', text); // Debug logging
      let transactions = parseTableText(text);
      if (transactions.length === 0) {
        // Fallback to OCR for PDFs if table parsing fails
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const { data: { text: ocrText } } = await Tesseract.recognize(pdfBlob, 'eng', {
          logger: (m) => console.log(m),
        });
        console.log('OCR Extracted PDF Text:', ocrText);
        transactions = parseTableText(ocrText);
      }
      return transactions;
    } catch (error) {
      throw new Error('Failed to process PDF: ' + error.message);
    }
  };

  const parseReceiptText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let transaction = { type: 'Expense', category: 'General', date: new Date().toISOString().split('T')[0] };
    
    const amountRegex = /total[:\s]*\$?(\d+\.?\d{0,2})/i;
    const dateRegex = /\d{1,2}-\d{1,2}-\d{2,4}/; // Fixed unnecessary escapes
    const descriptionRegex = /(description|item)[:\s]*(.*)/i;

    lines.forEach(line => {
      if (amountRegex.test(line)) {
        transaction.amount = parseFloat(line.match(amountRegex)[1]);
      }
      if (dateRegex.test(line)) {
        transaction.date = line.match(dateRegex)[0];
      }
      if (descriptionRegex.test(line)) {
        transaction.description = line.match(descriptionRegex)[2].substring(0, 100);
      }
    });

    return transaction.amount ? [transaction] : [];
  };

  const parseTableText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const transactions = [];
    const dateRegex = /\d{1,2}-\d{1,2}-\d{2,4}/; // Fixed unnecessary escapes
    const amountRegex = /\$?\d{1,3}(?:,?\d{3})*\.?\d{0,2}\b/;
    const typeOptions = ['Income', 'Expense'];

    lines.forEach(line => {
      const parts = line.split(/\s{2,}|\t/).filter(part => part);
      if (parts.length >= 3) {
        const dateMatch = parts.find(part => dateRegex.test(part));
        const amountMatch = parts.find(part => amountRegex.test(part));
        if (dateMatch && amountMatch) {
          const type = parts.find(part => typeOptions.includes(part)) || 'Expense';
          const description = parts.filter(part => !dateRegex.test(part) && !amountRegex.test(part) && !typeOptions.includes(part))[0] || 'N/A';
          transactions.push({
            type: type,
            date: dateMatch,
            description: description.substring(0, 100),
            amount: parseFloat(amountMatch.replace(/[^0-9.-]/g, '')),
            category: 'General'
          });
        }
      }
    });

    return transactions.length > 0 ? transactions : [];
  };

  const handleExtract = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      let transactions;
      if (file.type.includes('image')) {
        transactions = await extractFromImage(file);
      } else if (file.type === 'application/pdf') {
        transactions = await extractFromPDF(file);
      }

      if (transactions.length === 0) {
        setError('No valid transaction data extracted. Ensure the file contains recognizable dates (e.g., DD-MM-YYYY) and amounts (e.g., 25000).');
      } else {
        setExtractedData(transactions);
      }
    } catch (error) {
      setError('Error processing file: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setEditCategory(extractedData[index].category);
  };

  const handleEditDescription = (index) => {
    setEditingDescriptionIndex(index);
    setEditDescription(extractedData[index].description || '');
  };

  const handleSaveCategory = (index) => {
    if (!editCategory) {
      setError('Please provide a category.');
      return;
    }

    const updatedData = [...extractedData];
    updatedData[index] = {
      ...updatedData[index],
      category: editCategory
    };
    setExtractedData(updatedData);
    setEditingCategoryIndex(null);
    setEditCategory('');
  };

  const handleSaveDescription = (index) => {
    if (!editDescription) {
      setError('Please provide a description.');
      return;
    }

    const updatedData = [...extractedData];
    updatedData[index] = {
      ...updatedData[index],
      description: editDescription.length > 100 ? editDescription.substring(0, 100) : editDescription
    };
    setExtractedData(updatedData);
    setEditingDescriptionIndex(null);
    setEditDescription('');
  };

  const handleSubmitTransactions = async () => {
    try {
      for (const transaction of extractedData) {
        if (!transaction.category || !transaction.description) {
          setError('All transactions must have a category and description.');
          return;
        }
        await createTransaction(transaction);
      }
      setExtractedData([]);
      setFile(null);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to save transactions: ' + error.message);
    }
  };

  return (
    <Layout user={user}>
      <div className='text-center'>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-6">
          Add Transaction
        </h1>
      </div>
      <div className="container text-center bg-gray-800 p-6 rounded-lg shadow-lg">
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-200 mb-2">Upload Receipt or Transaction History (PNG, PDF, or Image)</label>
            <input
              type="file"
              accept="image/png,application/pdf,image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <button
              onClick={handleExtract}
              disabled={isProcessing || !file}
              className={`mt-2 px-4 py-2 rounded-md text-white ${isProcessing || !file ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? 'Processing...' : 'Extract Data'}
            </button>
          </div>

          {extractedData.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-200">Extracted Transactions</h2>
              {extractedData.map((transaction, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-700">
                  <p className="text-gray-200"><strong>Type:</strong> {transaction.type}</p>
                  <p className="text-gray-200"><strong>Amount:</strong> ${transaction.amount}</p>
                  <p className="text-gray-200"><strong>Date:</strong> {transaction.date}</p>
                  <p className="text-gray-200">
                    <strong>Description:</strong>{' '}
                    {editingDescriptionIndex === index ? (
                      <div className="inline-flex items-center">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="p-1 border rounded-md w-48 text-white bg-gray-600"
                          placeholder="Enter description"
                        />
                        <button
                          onClick={() => handleSaveDescription(index)}
                          className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        {transaction.description || 'N/A'}{' '}
                        <button
                          onClick={() => handleEditDescription(index)}
                          className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </p>
                  <p className="text-gray-200">
                    <strong>Category:</strong>{' '}
                    {editingCategoryIndex === index ? (
                      <div className="inline-flex items-center">
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="p-1 border rounded-md w-48 text-white bg-gray-600"
                          placeholder="Enter category"
                        />
                        <button
                          onClick={() => handleSaveCategory(index)}
                          className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        {transaction.category}{' '}
                        <button
                          onClick={() => handleEditCategory(index)}
                          className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </p>
                </div>
              ))}
              <button
                onClick={handleSubmitTransactions}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Transactions
              </button>
            </div>
          )}
        </div>
      </div>
      <br />
      <div className="container text-center bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-200">Manual Entry</h2>
        <div className="max-w-md mx-auto">
          <TransactionForm />
        </div>
      </div>
    </Layout>
  );
};

export default AddTransaction;