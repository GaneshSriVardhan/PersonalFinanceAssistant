import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import { createTransactionBatch } from '../services/api';

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
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
    if (selectedFile) {
      if (selectedFile.type.includes('image') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PNG, PDF, or other image file.');
        setFile(null);
      }
    }
  };

  const extractFromImage = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });
      return parseReceiptText(text);
    } catch (error) {
      throw new Error('Failed to process image: ' + error.message);
    }
  };

  const extractFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Try extracting text content first (for text-based PDFs)
        const content = await page.getTextContent();
        const rows = {};
        content.items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!rows[y]) rows[y] = [];
          rows[y].push(item.str);
        });

        const sortedY = Object.keys(rows).sort((a, b) => b - a);
        for (const y of sortedY) {
          fullText += rows[y].join(' ') + '\n';
        }

        // If no meaningful text was extracted, try rendering the page as an image and performing OCR
        if (!fullText.trim() || fullText.trim() === '#') {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageData = canvas.toDataURL('image/png');
          const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
            logger: (m) => console.log(m),
          });

          fullText += text + '\n';
        }
      }

      // Try parsing as table text first
      let transactions = parseTableText(fullText);
      if (transactions.length === 0) {
        // Fallback to receipt text parsing if table parsing yields no results
        transactions = parseReceiptText(fullText);
      }

      return transactions;
    } catch (error) {
      throw new Error('Failed to process PDF: ' + error.message);
    }
  };

  const parseReceiptText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let transaction = { type: 'Expense', category: 'General', date: '2025-07-05' };
    const amountRegex = /total[:\s]*\$?(\d+\.?\d{0,2})/i;
    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
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

    return [transaction];
  };

  const parseTableText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const transactions = [];

    for (let line of lines) {
      const parts = line.split(/\s{2,}/);

      if (parts.length < 4) continue;

      let [type, date, ...rest] = parts;
      let amount = rest.pop();
      let category = rest.join(' ');

      type = type.trim();
      date = date.trim().replace(/\s+/g, '');
      category = category.trim();
      amount = parseFloat(amount.replace(/,/g, ''));

      if (type && date && category && amount) {
        transactions.push({
          type,
          date,
          category,
          amount,
          description: ''
        });
      }
    }

    return transactions;
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
      } else {
        throw new Error('Unsupported file type.');
      }

      if (transactions.length === 0) {
        setError('No valid transaction data extracted.');
      } else {
        setExtractedData(transactions);
      }
    } catch (error) {
      setError(error.message);
      console.error('Extraction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitTransactions = async () => {
    try {
      const cleanData = extractedData.map(tx => ({
        ...tx,
        description: tx.description || ' '
      }));

      await createTransactionBatch(cleanData);

      setExtractedData([]);
      setFile(null);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to save transactions: ' + (error.response?.data?.message || error.message));
      console.error('Batch save error:', error.response?.data || error.message);
    }
  };

  return (
    <Layout user={user}>
      <div className='text-center'>
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Add Transaction</h1>
      </div>

      <div className="container text-center bg-gray-800 p-6 rounded-lg shadow-lg">
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="max-w-md mx-auto">
          <label className="block text-gray-200 mb-2">Upload Receipt or PDF</label>
          <input
            type="file"
            accept="image/png,application/pdf,image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
          
          <div className="mt-6 text-left text-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-200 text-center">Review Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center max-w-6xl mx-auto">
              {extractedData.map((t, i) => (
                <div key={i} className="mb-4 p-4 border rounded-md bg-gray-700 w-full max-w-sm">
                  <p><strong>Date:</strong> {t.date}</p>
                  <p><strong>Type:</strong> {t.type}</p>
                  <p><strong>Amount:</strong> ${t.amount}</p>
                  <p><strong>Category:</strong> {
                    editingCategoryIndex === i ? (
                      <span>
                        <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="p-1 bg-gray-600 rounded text-white" />
                        <button onClick={() => {
                          const updated = [...extractedData];
                          updated[i].category = editCategory;
                          setExtractedData(updated);
                          setEditingCategoryIndex(null);
                        }} className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                      </span>
                    ) : (
                      <span>{t.category || 'N/A'} <button onClick={() => {
                        setEditingCategoryIndex(i);
                        setEditCategory(t.category);
                      }} className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button></span>
                    )
                  }</p>
                  <p><strong>Description:</strong> {
                    editingDescriptionIndex === i ? (
                      <span>
                        <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className="p-1 bg-gray-600 rounded text-white" />
                        <button onClick={() => {
                          const updated = [...extractedData];
                          updated[i].description = editDescription;
                          setExtractedData(updated);
                          setEditingDescriptionIndex(null);
                        }} className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                      </span>
                    ) : (
                      <span>{t.description || 'N/A'} <button onClick={() => {
                        setEditingDescriptionIndex(i);
                        setEditDescription(t.description);
                      }} className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button></span>
                    )
                  }</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button
                onClick={handleSubmitTransactions}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Transactions
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container text-center bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-200">Manual Entry</h2>
        <div className="max-w-md mx-auto">
          <TransactionForm />
        </div>
      </div>
    </Layout>
  );
};

export default AddTransaction;