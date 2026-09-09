import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  FileText,
  FileSpreadsheet,
  File,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table as TableIcon,
  Type,
  Calendar,
  Layers,
  Sparkles,
  Move,
  CheckSquare,
  Heading1,
  Heading2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  ShieldAlert,
  User,
  CreditCard,
  Building,
  Edit2,
  Sliders
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../config/api';

const ALLOWED_ROLES = ['manager', 'reporting manager', 'tenant admin', 'company admin', 'admin', 'super admin'];

// Helper to sanitize any string so that pdf-lib's WinAnsi encoding never throws WinAnsi cannot encode
const safePdfText = (font, text) => {
  if (!text) return '';
  // Step 1: Normalize smart quotes, dashes, bullets, and non-breaking spaces to ASCII
  const normalized = String(text)
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Remove control characters & unmapped WinAnsi characters (specifically 0x0080 to 0x009F)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  if (!font || !font.encodeText) return normalized;

  // Step 2: Test every character with font.encodeText, replacing any invalid ones with a space
  let safeResult = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    try {
      font.encodeText(char);
      safeResult += char;
    } catch {
      safeResult += ' ';
    }
  }
  return safeResult;
};

const safeTextWidth = (font, text, size) => {
  try {
    const safeStr = safePdfText(font, text);
    return font.widthOfTextAtSize(safeStr, size);
  } catch {
    return (text || '').length * (size * 0.55);
  }
};

const safeDrawText = (page, font, text, options) => {
  try {
    const safeStr = safePdfText(font, text);
    if (!safeStr) return;
    page.drawText(safeStr, { ...options, font });
  } catch (err) {
    console.warn('safeDrawText warning caught:', err);
  }
};

export default function CloudDocumentEditor({
  isOpen,
  onClose,
  document: initialDoc,
  companySlug,
  onSaved
}) {
  const [doc, setDoc] = useState(initialDoc || {});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);

  // Role validation
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const isAuthorized = ALLOWED_ROLES.includes(userRole);

  // Editable Document Metadata Fields
  const [fields, setFields] = useState({
    name: '',
    customerName: '',
    accountNumber: '',
    customerId: '',
    facilityNumber: '',
    branch: '',
    documentType: '',
    documentDate: '',
    description: ''
  });

  // Detect file type
  const ext = (
    doc.extension ||
    (doc.originalFileName ? doc.originalFileName.split('.').pop() : '') ||
    (doc.name ? doc.name.split('.').pop() : '') ||
    (doc.fileType || '')
  ).replace('.', '').toLowerCase();

  const isPdf = ext === 'pdf' || (doc?.mimeType && doc.mimeType.includes('pdf'));
  const isExcel = ['xlsx', 'xls', 'csv'].includes(ext) || (doc?.mimeType && (doc.mimeType.includes('spreadsheet') || doc.mimeType.includes('csv') || doc.mimeType.includes('excel')));
  const isWord = ['docx', 'doc', 'txt', 'rtf'].includes(ext) || (!isPdf && !isExcel);

  // ════════════════════ PDF STATE ════════════════════
  const [pdfPages, setPdfPages] = useState([{ id: 1, title: 'Page 1', content: '', annotations: [] }]);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [pdfRawBytes, setPdfRawBytes] = useState(null);

  // ════════════════════ WORD STATE ════════════════════
  const [wordPages, setWordPages] = useState([{ id: 1, content: '' }]);
  const [activeWordPage, setActiveWordPage] = useState(1);
  const wordEditorRefs = useRef({});

  // ════════════════════ EXCEL STATE ════════════════════
  const [sheets, setSheets] = useState([
    {
      name: 'Sheet 1',
      data: Array.from({ length: 25 }, () => Array.from({ length: 10 }, () => ''))
    }
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 });
  const [cellInputVal, setCellInputVal] = useState('');

  // Synchronize document & load content
  useEffect(() => {
    if (!isOpen || !initialDoc) return;
    setDoc(initialDoc);
    setSaveSuccess('');
    setSaveError('');
    setLoading(true);

    const toDateInput = (d) => {
      if (!d) return '';
      try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return '';
        return dt.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    setFields({
      name: initialDoc.name || initialDoc.originalFileName || '',
      customerName: initialDoc.customerName || initialDoc.customerRef || '',
      accountNumber: initialDoc.accountNumber || '',
      customerId: initialDoc.customerId || initialDoc.cifNumber || '',
      facilityNumber: initialDoc.facilityNumber || initialDoc.facilityRef || '',
      branch: initialDoc.branch || '',
      documentType: initialDoc.documentType || initialDoc.aiClassification || '',
      documentDate: toDateInput(initialDoc.documentDate || initialDoc.executionDate || initialDoc.createdAt),
      description: initialDoc.description || ''
    });

    const token = localStorage.getItem('accessToken') || '';
    const docId = initialDoc._id || initialDoc.id;
    const storedSlug = localStorage.getItem('companySlug') || localStorage.getItem('tenantSlug') || '';
    const effectiveSlug = companySlug || initialDoc.tenantId || (storedSlug && storedSlug !== 'undefined' && storedSlug !== 'null' ? storedSlug : '') || 'default';
    const previewUrl = docId ? `${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${docId}/preview?token=${token}` : '';
    const detailsUrl = docId ? `${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${docId}` : '';

    const loadContent = async () => {
      let documentFullText = initialDoc.extractedText || '';

      // Attempt to fetch full document record to ensure latest extractedText
      try {
        if (detailsUrl && token) {
          const detailRes = await fetch(detailsUrl, { headers: { Authorization: `Bearer ${token}` } });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData?.data?.document?.extractedText) {
              documentFullText = detailData.data.document.extractedText;
            }
          }
        }
      } catch (dErr) {
        console.warn('Could not fetch latest doc details:', dErr);
      }

      try {
        if (isPdf) {
          // Fetch raw PDF bytes
          if (previewUrl) {
            const res = await fetch(previewUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              setPdfRawBytes(arrayBuffer);
              try {
                const loadedPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const pageCount = loadedPdf.getPageCount();
                const initialPages = [];
                const extractedChunks = documentFullText.split(/\n\s*\n/).filter(c => c.trim().length > 0);
                
                for (let i = 1; i <= Math.max(pageCount, 1); i++) {
                  const chunk = extractedChunks[i - 1] || (i === 1 ? documentFullText : '');
                  initialPages.push({
                    id: i,
                    title: `Page ${i}`,
                    content: chunk || `[Page ${i} Content]\nType or edit text here...`,
                    annotations: []
                  });
                }
                setPdfPages(initialPages);
              } catch (pErr) {
                console.warn('PDF load warning:', pErr);
                setPdfPages([
                  { id: 1, title: 'Page 1', content: documentFullText || 'Document Content\n\nClick to edit existing text or add new text...', annotations: [] }
                ]);
              }
            } else {
              setPdfPages([
                { id: 1, title: 'Page 1', content: documentFullText || 'Document Content\n\nClick to edit existing text...', annotations: [] }
              ]);
            }
          }
        } else if (isExcel) {
          // Fetch raw excel or CSV
          let parsedSuccessfully = false;
          if (previewUrl) {
            try {
              const res = await fetch(previewUrl, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                const wb = XLSX.read(arrayBuffer, { type: 'array' });
                const loadedSheets = wb.SheetNames.map(sheetName => {
                  const ws = wb.Sheets[sheetName];
                  const rawAoA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                  const rowCount = Math.max(rawAoA.length, 25);
                  const colCount = Math.max(...rawAoA.map(r => r.length), 10);
                  const normalized = [];
                  for (let r = 0; r < rowCount; r++) {
                    const row = [];
                    for (let c = 0; c < colCount; c++) {
                      row.push(rawAoA[r]?.[c] !== undefined ? String(rawAoA[r][c]) : '');
                    }
                    normalized.push(row);
                  }
                  return { name: sheetName, data: normalized };
                });

                if (loadedSheets.length > 0) {
                  setSheets(loadedSheets);
                  parsedSuccessfully = true;
                }
              }
            } catch (xErr) {
              console.warn('Excel parse warning:', xErr);
            }
          }

          if (!parsedSuccessfully) {
            // Parse fallback text into spreadsheet
            const lines = (documentFullText || '').split('\n').filter(l => l.trim());
            const grid = Array.from({ length: Math.max(lines.length + 10, 25) }, () => Array.from({ length: 10 }, () => ''));
            if (lines.length > 0) {
              lines.forEach((line, rIdx) => {
                const parts = line.split(/[,\t|]/);
                parts.forEach((p, cIdx) => {
                  if (cIdx < 10) grid[rIdx][cIdx] = p.trim();
                });
              });
            } else {
              // Default populated sample structure
              grid[0] = ['Item / Field', 'Description / Detail', 'Value / Amount', 'Status', 'Date', '', '', '', '', ''];
              grid[1] = ['Customer', initialDoc.customerName || 'Acme Corp', 'CIF-10928', 'Active', new Date().toISOString().split('T')[0], '', '', '', '', ''];
              grid[2] = ['Account', initialDoc.accountNumber || '501004928172', 'Checking', 'Verified', new Date().toISOString().split('T')[0], '', '', '', '', ''];
            }
            setSheets([{ name: 'Sheet 1', data: grid }]);
          }
        } else {
          // Word / Text document
          const initialText = documentFullText || (initialDoc.description ? `${initialDoc.name}\n\n${initialDoc.description}` : 'Start typing or editing your document content here...');
          const paragraphs = initialText.split(/\n\s*\n/).filter(Boolean);
          if (paragraphs.length > 0) {
            setWordPages(paragraphs.map((p, idx) => ({ id: idx + 1, content: p })));
          } else {
            setWordPages([{ id: 1, content: initialText }]);
          }
        }
      } catch (err) {
        console.error('Error initializing cloud editor content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isOpen, initialDoc]);

  if (!isOpen || !doc) return null;

  // ════════════════════ FIELD UPDATES ════════════════════
  const handleFieldChange = (key, value) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ════════════════════ EXCEL HELPERS ════════════════════
  const getColLabel = (index) => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode((num % 26) + 65) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const handleCellClick = (r, c) => {
    setSelectedCell({ r, c });
    const currentVal = sheets[activeSheetIndex]?.data[r]?.[c] || '';
    setCellInputVal(currentVal);
  };

  const handleCellChange = (r, c, val) => {
    setSheets(prev => {
      const copy = [...prev];
      const currentSheet = { ...copy[activeSheetIndex] };
      const currentData = currentSheet.data.map(row => [...row]);
      if (!currentData[r]) currentData[r] = [];
      currentData[r][c] = val;
      currentSheet.data = currentData;
      copy[activeSheetIndex] = currentSheet;
      return copy;
    });
    setCellInputVal(val);
  };

  const handleAddExcelSheet = () => {
    setSheets(prev => [
      ...prev,
      {
        name: `Sheet ${prev.length + 1}`,
        data: Array.from({ length: 25 }, () => Array.from({ length: 10 }, () => ''))
      }
    ]);
    setActiveSheetIndex(sheets.length);
  };

  const handleAddExcelRow = () => {
    setSheets(prev => {
      const copy = [...prev];
      const currentSheet = { ...copy[activeSheetIndex] };
      const currentData = currentSheet.data.map(row => [...row]);
      const colCount = currentData[0]?.length || 10;
      currentData.push(Array.from({ length: colCount }, () => ''));
      currentSheet.data = currentData;
      copy[activeSheetIndex] = currentSheet;
      return copy;
    });
  };

  const handleAddExcelCol = () => {
    setSheets(prev => {
      const copy = [...prev];
      const currentSheet = { ...copy[activeSheetIndex] };
      const currentData = currentSheet.data.map(row => [...row, '']);
      currentSheet.data = currentData;
      copy[activeSheetIndex] = currentSheet;
      return copy;
    });
  };

  const handleDeleteExcelRow = (rIdx) => {
    if (sheets[activeSheetIndex].data.length <= 1) return;
    setSheets(prev => {
      const copy = [...prev];
      const currentSheet = { ...copy[activeSheetIndex] };
      const currentData = currentSheet.data.filter((_, idx) => idx !== rIdx);
      currentSheet.data = currentData;
      copy[activeSheetIndex] = currentSheet;
      return copy;
    });
  };

  // ════════════════════ WORD HELPERS ════════════════════
  const handleAddWordPage = () => {
    setWordPages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        content: `[Page ${prev.length + 1} Content]\nType or edit paragraph here...`
      }
    ]);
    setActiveWordPage(wordPages.length + 1);
  };

  const handleDeleteWordPage = (pageId) => {
    if (wordPages.length <= 1) return;
    setWordPages(prev => prev.filter(p => p.id !== pageId));
    setActiveWordPage(prev => Math.max(1, prev - 1));
  };

  const handleWordPageContentChange = (pageId, newContent) => {
    setWordPages(prev => prev.map(p => p.id === pageId ? { ...p, content: newContent } : p));
  };

  // ════════════════════ PDF HELPERS ════════════════════
  const handleAddPdfPage = () => {
    setPdfPages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        title: `Page ${prev.length + 1} (New)`,
        content: `[Page ${prev.length + 1} Content]\nType new page text or notes here...`,
        annotations: []
      }
    ]);
    setActivePdfPage(pdfPages.length + 1);
  };

  const handleDeletePdfPage = (pageId) => {
    if (pdfPages.length <= 1) return;
    setPdfPages(prev => prev.filter(p => p.id !== pageId));
    setActivePdfPage(prev => Math.max(1, prev - 1));
  };

  const handleAddPdfAnnotation = (text = 'VERIFIED & APPROVED') => {
    setPdfPages(prev => {
      const copy = [...prev];
      const targetPage = copy.find(p => p.id === activePdfPage);
      if (targetPage) {
        targetPage.annotations.push({
          id: Date.now(),
          text,
          x: 40,
          y: 60 + targetPage.annotations.length * 40,
          fontSize: 13,
          color: '#1e3a8a'
        });
      }
      return copy;
    });
  };

  // ════════════════════ SAVE TO CLOUD FUNCTION ════════════════════
  const handleSaveToCloud = async () => {
    if (!isAuthorized) {
      setSaveError('Permission Denied: Only Managers and Reporting Managers can update documents in the cloud.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      let fileToUpload = null;
      let textContent = '';

      if (isPdf) {
        // Compile clean PDF using pdf-lib with proper replacement
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        for (let i = 0; i < pdfPages.length; i++) {
          const pageState = pdfPages[i];
          const page = pdfDoc.addPage([595.28, 841.89]); // A4 (595 x 842 pt)
          const { width, height } = page.getSize();

          // Header
          safeDrawText(page, boldFont, (fields.name || doc.name || 'Document').toUpperCase(), {
            x: 40,
            y: height - 40,
            size: 9,
            color: rgb(0.2, 0.3, 0.5)
          });

          safeDrawText(page, font, `Page ${i + 1} of ${pdfPages.length}`, {
            x: width - 100,
            y: height - 40,
            size: 9,
            color: rgb(0.4, 0.4, 0.4)
          });

          // Header divider
          page.drawLine({
            start: { x: 40, y: height - 48 },
            end: { x: width - 40, y: height - 48 },
            thickness: 0.75,
            color: rgb(0.8, 0.85, 0.9)
          });

          // Body Text (Wrapped & clean replacement)
          let currentY = height - 70;
          const content = pageState.content || '';
          const paragraphs = content.split('\n');

          for (const para of paragraphs) {
            if (currentY < 55) break;
            if (!para.trim()) {
              currentY -= 12;
              continue;
            }

            const cleanPara = safePdfText(font, para);
            const words = cleanPara.split(' ');
            let currentLine = '';

            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const textWidth = safeTextWidth(font, testLine, 10);

              if (textWidth > (width - 80)) {
                if (currentY >= 55) {
                  safeDrawText(page, font, currentLine, {
                    x: 40,
                    y: currentY,
                    size: 10,
                    color: rgb(0.1, 0.1, 0.1)
                  });
                  currentY -= 14;
                }
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine && currentY >= 55) {
              safeDrawText(page, font, currentLine, {
                x: 40,
                y: currentY,
                size: 10,
                color: rgb(0.1, 0.1, 0.1)
              });
              currentY -= 16;
            }
          }

          // Annotations & Stamps
          pageState.annotations?.forEach((ann) => {
            safeDrawText(page, boldFont, ann.text || '', {
              x: ann.x || 40,
              y: Math.max(50, Math.min(height - 60, height - (ann.y || 100))),
              size: ann.fontSize || 12,
              color: rgb(0.1, 0.35, 0.8)
            });
          });

          // Footer
          page.drawLine({
            start: { x: 40, y: 40 },
            end: { x: width - 40, y: 40 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85)
          });

          safeDrawText(page, font, `Document ID: ${doc._id || 'DMS-DOC'} - Updated: ${new Date().toLocaleDateString()}`, {
            x: 40,
            y: 28,
            size: 8,
            color: rgb(0.5, 0.5, 0.5)
          });
        }

        let pdfBytes = null;
        try {
          pdfBytes = await pdfDoc.save();
        } catch (pdfSaveErr) {
          console.warn('pdfDoc.save warning, using safe fallback:', pdfSaveErr);
          const fallbackDoc = await PDFDocument.create();
          const fallbackFont = await fallbackDoc.embedFont(StandardFonts.Helvetica);
          const fbPage = fallbackDoc.addPage([595.28, 841.89]);
          safeDrawText(fbPage, fallbackFont, fields.name || doc.name || 'Document', { x: 40, y: 800, size: 14 });
          pdfBytes = await fallbackDoc.save();
        }

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = doc.originalFileName || `${fields.name || doc.name || 'document'}.pdf`;
        fileToUpload = new window.File([blob], fileName, { type: 'application/pdf' });
        textContent = pdfPages.map(p => safePdfText(null, p.content)).join('\n\n');

      } else if (isExcel) {
        // Build Excel Workbook using xlsx
        const wb = XLSX.utils.book_new();
        sheets.forEach(sheet => {
          const trimmedData = sheet.data.filter(row => row.some(cell => String(cell).trim() !== ''));
          const ws = XLSX.utils.aoa_to_sheet(trimmedData.length > 0 ? trimmedData : sheet.data.slice(0, 5));
          XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
        });

        const excelBuffer = XLSX.write(wb, { bookType: ext === 'csv' ? 'csv' : 'xlsx', type: 'array' });
        const mime = ext === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([excelBuffer], { type: mime });
        const fileName = doc.originalFileName || `${fields.name || doc.name || 'spreadsheet'}.${ext === 'csv' ? 'csv' : 'xlsx'}`;
        fileToUpload = new window.File([blob], fileName, { type: mime });
        textContent = sheets.map(s => s.data.map(r => r.join('\t')).join('\n')).join('\n\n');

      } else {
        // Word / Text Mode
        const plainText = wordPages.map((p, idx) => `--- PAGE ${idx + 1} ---\n${p.content}`).join('\n\n');
        const formattedHtml = wordPages.map((p) => `<div class="doc-page" style="margin-bottom:30px; font-family:sans-serif;">${p.content.split('\n').map(l => `<p>${l}</p>`).join('')}</div>`).join('<hr/>');
        const blob = new Blob([formattedHtml], { type: 'application/msword;charset=utf-8' });
        const fileName = doc.originalFileName || `${fields.name || doc.name || 'document'}.docx`;
        fileToUpload = new window.File([blob], fileName, { type: 'application/msword' });
        textContent = plainText;
      }

      const token = localStorage.getItem('accessToken') || '';
      const docId = doc._id || doc.id;
      const storedSlug = localStorage.getItem('companySlug') || localStorage.getItem('tenantSlug') || '';
      const effectiveSlug = companySlug || doc.tenantId || (storedSlug && storedSlug !== 'undefined' && storedSlug !== 'null' ? storedSlug : '') || 'default';

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('extractedText', textContent);
      formData.append('name', fields.name || doc.name);
      formData.append('customerName', fields.customerName);
      formData.append('accountNumber', fields.accountNumber);
      formData.append('customerId', fields.customerId);
      formData.append('facilityNumber', fields.facilityNumber);
      formData.append('branch', fields.branch);
      formData.append('documentType', fields.documentType);
      formData.append('description', fields.description);
      if (fields.documentDate) formData.append('documentDate', fields.documentDate);
      formData.append('comment', `Cloud Edited: Changes saved by ${userRole}`);

      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${docId}/save-content`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      let data = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text ? text.substring(0, 150) : 'Invalid server response'}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save updated file content to cloud.');
      }

      const updatedDoc = data.data?.document || data.data || { ...doc, ...fields, extractedText: textContent };
      setDoc(updatedDoc);
      setSaveSuccess(`Changes have been saved successfully! (Version ${updatedDoc.versionNumber || (doc.versionNumber + 1)})`);
      setShowSaveSuccessPopup(true);
      if (onSaved) onSaved(updatedDoc);

    } catch (err) {
      console.error('Cloud save error:', err);
      setSaveError(err.message || 'Error occurred while saving document to cloud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-7xl h-[95vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">

        {/* ════════════════════ TOP APP BAR (WHITE THEME) ════════════════════ */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 shrink-0 z-30">
          
          {/* File Name & Editor Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              {isPdf && <FileText className="text-red-600" size={20} />}
              {isExcel && <FileSpreadsheet className="text-emerald-600" size={20} />}
              {isWord && <File className="text-blue-600" size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-slate-900 font-bold text-sm sm:text-base truncate max-w-sm sm:max-w-md">
                  {fields.name || doc.name || doc.originalFileName || 'Document'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 uppercase tracking-wider">
                  {isPdf ? 'PDF Cloud Editor' : isExcel ? 'Excel Cloud Editor' : 'Word Cloud Editor'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  v{doc.versionNumber || 1}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate font-medium">
                {isAuthorized
                  ? 'Click any existing text, line, or field to edit • Add new pages • Save to cloud'
                  : 'Read Only Mode • Only Manager & Reporting Manager can edit'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowFieldsPanel(!showFieldsPanel)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                showFieldsPanel
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Key Document Fields & Metadata"
            >
              <Sliders size={14} />
              <span>Document Fields</span>
              {showFieldsPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {isAuthorized ? (
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save to Cloud</span>
                  </>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <ShieldAlert size={14} />
                <span>Read-Only (Manager Only)</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
              title="Close Editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ════════════════════ COLLAPSIBLE KEY FIELDS PANEL (WHITE THEME) ════════════════════ */}
        {showFieldsPanel && (
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0 z-20 transition-all">
            <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Edit2 size={13} />
                <span>Editable Key Document Data & Attributes</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">Edit customer, account, and document values directly</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Document Title</label>
                <input
                  type="text"
                  value={fields.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Document Name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Customer / Entity Name</label>
                <input
                  type="text"
                  value={fields.customerName}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="Customer Name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={fields.accountNumber}
                  onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                  placeholder="Account Number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Customer / CIF ID</label>
                <input
                  type="text"
                  value={fields.customerId}
                  onChange={(e) => handleFieldChange('customerId', e.target.value)}
                  placeholder="CIF-12345"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Facility / Loan No</label>
                <input
                  type="text"
                  value={fields.facilityNumber}
                  onChange={(e) => handleFieldChange('facilityNumber', e.target.value)}
                  placeholder="Facility Ref"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Document Date</label>
                <input
                  type="date"
                  value={fields.documentDate}
                  onChange={(e) => handleFieldChange('documentDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications & Alert Banner */}
        {(saveSuccess || saveError) && (
          <div className="px-6 py-2.5 shrink-0 z-30 bg-slate-50 border-b border-slate-200">
            {saveSuccess && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
                <button onClick={() => setSaveSuccess('')} className="text-emerald-700 hover:text-emerald-900"><X size={14} /></button>
              </div>
            )}
            {saveError && (
              <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
                <button onClick={() => setSaveError('')} className="text-red-700 hover:text-red-900"><X size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ EDITOR WORKSPACE (LIGHT THEME) ════════════════════ */}
        <div className="flex-1 relative overflow-hidden bg-slate-100 flex flex-col">

          {/* ─────────────────── 1. PDF EDITOR MODE ─────────────────── */}
          {isPdf && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              
              {/* PDF Secondary Controls Toolbar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Pages:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                    {pdfPages.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setActivePdfPage(page.id)}
                        className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          activePdfPage === page.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{page.title}</span>
                        {pdfPages.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePdfPage(page.id);
                            }}
                            className="hover:text-red-500 ml-1 font-bold"
                            title="Delete Page"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPdfPage}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Plus size={13} /> Add New Page
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddPdfAnnotation('VERIFIED & SIGNED')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    <CheckSquare size={13} className="text-emerald-600" /> Add Stamp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPdfAnnotation(`DATE: ${new Date().toLocaleDateString()}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Calendar size={13} className="text-blue-600" /> Add Date
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPdfAnnotation('REMARK: Updated in Cloud')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Type size={13} className="text-amber-600" /> Add Remark
                  </button>
                </div>
              </div>

              {/* PDF Visual Page Canvas Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-slate-100 space-y-6">
                {pdfPages.map(page => {
                  const isCurrent = page.id === activePdfPage;
                  return (
                    <div
                      key={page.id}
                      onClick={() => setActivePdfPage(page.id)}
                      className={`w-full max-w-3xl min-h-[850px] bg-white rounded-2xl border ${
                        isCurrent ? 'border-blue-500 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/20' : 'border-slate-200 shadow-md'
                      } p-8 relative flex flex-col justify-between transition duration-150`}
                    >
                      {/* Page Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500 mb-4">
                        <span className="font-bold text-slate-900 uppercase tracking-wider">{page.title}</span>
                        <span>{fields.name || doc.name || 'PDF Document'}</span>
                      </div>

                      {/* Interactive Document Paragraphs & Content */}
                      <div className="flex-1 flex flex-col">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                          <Edit2 size={12} />
                          <span>Click anywhere below to edit existing text or add new text:</span>
                        </div>
                        <textarea
                          value={page.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPdfPages(prev => prev.map(p => p.id === page.id ? { ...p, content: val } : p));
                          }}
                          placeholder="Click to edit or add content for this page..."
                          className="w-full flex-1 min-h-[550px] bg-slate-50 rounded-xl border border-slate-200 p-4 text-slate-900 placeholder:text-slate-400 outline-none resize-none font-mono text-xs leading-relaxed focus:border-blue-500 focus:bg-white transition"
                        />

                        {/* Annotations & Stamps */}
                        {page.annotations && page.annotations.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Page Overlays & Stamps:</span>
                            <div className="flex flex-wrap gap-2">
                              {page.annotations.map((ann, aIdx) => (
                                <div
                                  key={ann.id || aIdx}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs"
                                >
                                  <input
                                    type="text"
                                    value={ann.text}
                                    onChange={(e) => {
                                      const textVal = e.target.value;
                                      setPdfPages(prev => prev.map(p => {
                                        if (p.id === page.id) {
                                          const copyAnn = [...p.annotations];
                                          copyAnn[aIdx].text = textVal;
                                          return { ...p, annotations: copyAnn };
                                        }
                                        return p;
                                      }));
                                    }}
                                    className="bg-transparent border-0 outline-none text-blue-800 font-bold min-w-[140px]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPdfPages(prev => prev.map(p => {
                                        if (p.id === page.id) {
                                          return { ...p, annotations: p.annotations.filter((_, idx) => idx !== aIdx) };
                                        }
                                        return p;
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-700 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Page Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 mt-4">
                        <span>Page {page.id} of {pdfPages.length}</span>
                        <span className="font-mono">Editable Cloud Document</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ─────────────────── 2. WORD EDITOR MODE ─────────────────── */}
          {isWord && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              
              {/* Word Formatting Toolbar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Document Pages:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                    {wordPages.map((page, idx) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setActiveWordPage(page.id)}
                        className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          activeWordPage === page.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>Page {idx + 1}</span>
                        {wordPages.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWordPage(page.id);
                            }}
                            className="hover:text-red-500 ml-1 font-bold"
                            title="Delete Page"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWordPage}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Plus size={14} /> Add New Page
                  </button>
                </div>

                <span className="text-[11px] text-slate-500">Click into any paragraph box to edit existing content</span>
              </div>

              {/* Word Pages Visual Layout */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-slate-100 space-y-6">
                {wordPages.map((page, idx) => (
                  <div
                    key={page.id}
                    onClick={() => setActiveWordPage(page.id)}
                    className="w-full max-w-3xl min-h-[850px] bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative flex flex-col justify-between"
                  >
                    {/* Page Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500 mb-4">
                      <span className="font-bold text-slate-900 uppercase tracking-wider">{fields.name || doc.name || 'Word Document'}</span>
                      <div className="flex items-center gap-2">
                        <span>Page {idx + 1} of {wordPages.length}</span>
                        {wordPages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWordPage(page.id);
                            }}
                            className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                            title="Delete this page"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Editable Document Body */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                        <Edit2 size={12} />
                        <span>Page {idx + 1} Text & Content:</span>
                      </div>
                      <textarea
                        value={page.content}
                        onChange={(e) => handleWordPageContentChange(page.id, e.target.value)}
                        placeholder="Click to edit or add content for this page..."
                        className="w-full flex-1 min-h-[600px] bg-slate-50 rounded-xl border border-slate-200 p-5 text-slate-900 placeholder:text-slate-400 outline-none resize-none font-sans text-sm leading-relaxed focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Page Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 mt-4">
                      <span>Document ID: {doc._id || 'Cloud-Doc'}</span>
                      <span>Confidential Enterprise Asset</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ─────────────────── 3. EXCEL SPREADSHEET EDITOR MODE ─────────────────── */}
          {isExcel && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              
              {/* Excel Spreadsheet Top Controls Bar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 text-xs shadow-xs">
                
                {/* Formula / Cell Bar */}
                <div className="flex items-center gap-2 flex-1 max-w-xl">
                  <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-blue-700 min-w-[50px] text-center">
                    {getColLabel(selectedCell.c)}{selectedCell.r + 1}
                  </div>
                  <span className="text-slate-400 font-mono font-bold">fx:</span>
                  <input
                    type="text"
                    value={cellInputVal}
                    onChange={(e) => handleCellChange(selectedCell.r, selectedCell.c, e.target.value)}
                    placeholder="Enter value or formula..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 transition shadow-xs"
                  />
                </div>

                {/* Grid Structure Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddExcelRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Plus size={13} /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExcelCol}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Plus size={13} /> Add Column
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExcelRow(selectedCell.r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete Row
                  </button>
                </div>

              </div>

              {/* Spreadsheet Grid Table */}
              <div className="flex-1 overflow-auto bg-slate-100 p-4">
                <div className="inline-block min-w-full rounded-xl border border-slate-200 overflow-hidden shadow-md bg-white">
                  <table className="w-full border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 select-none">
                        <th className="w-12 px-2 py-2 border-r border-b border-slate-200 text-center font-bold">#</th>
                        {sheets[activeSheetIndex]?.data[0]?.map((_, cIdx) => (
                          <th key={cIdx} className="min-w-[120px] px-3 py-2 border-r border-b border-slate-200 text-center font-bold">
                            {getColLabel(cIdx)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheets[activeSheetIndex]?.data?.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-blue-50/40">
                          {/* Row Index Number */}
                          <td className="px-2 py-1.5 border-r border-b border-slate-200 text-center font-semibold text-slate-500 select-none bg-slate-50">
                            {rIdx + 1}
                          </td>
                          {/* Cells */}
                          {row.map((cellVal, cIdx) => {
                            const isSelected = selectedCell.r === rIdx && selectedCell.c === cIdx;
                            return (
                              <td
                                key={cIdx}
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                className={`p-0 border-r border-b border-slate-200 min-w-[120px] ${
                                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50 z-10' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={cellVal}
                                  onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                  className="w-full h-full px-2.5 py-1.5 bg-transparent text-slate-900 outline-none border-0 focus:ring-0 font-mono text-xs"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sheet Tabs Bar (Bottom) */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border-t border-slate-200 text-xs shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {sheets.map((sheet, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        setActiveSheetIndex(sIdx);
                        setSelectedCell({ r: 0, c: 0 });
                        setCellInputVal(sheet.data[0]?.[0] || '');
                      }}
                      className={`px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2 ${
                        activeSheetIndex === sIdx
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <FileSpreadsheet size={13} />
                      <span>{sheet.name}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddExcelSheet}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Plus size={13} /> Add Sheet
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  {sheets[activeSheetIndex]?.data?.length || 0} Rows • {sheets[activeSheetIndex]?.data?.[0]?.length || 0} Columns
                </span>
              </div>

            </div>
          )}

        </div>

        {/* ════════════════════ CLOUD EDITOR FETCHING LOADER ════════════════════ */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Loading Cloud Editor...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Fetching document content, metadata, and preparing your cloud workspace...
              </p>
              <div className="w-52 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6">
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ SAVE SUCCESS POPUP MODAL ════════════════════ */}
        {showSaveSuccessPopup && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 text-center relative animate-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setShowSaveSuccessPopup(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                Changes Have Been Saved!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Your document content, fields, and updates have been successfully saved to the cloud.
              </p>

              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Document:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[220px]">{fields.name || doc.name || doc.originalFileName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Version:</span>
                  <span className="font-bold text-blue-700 font-mono bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    v{doc.versionNumber || 1}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Saved in Cloud
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSaveSuccessPopup(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveSuccessPopup(false);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Close Editor
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

