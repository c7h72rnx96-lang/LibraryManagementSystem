// === src/pages/Books/BulkUpload.jsx ===
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaArrowLeft, FaFileCsv } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
// Grab the API key from your .env file
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const BulkUpload = () => {
  const navigate = useNavigate();
  const [importType, setImportType] = useState("isbn");
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  // Mode 1: OpenLibrary-based metadata & cover fetcher
  async function fetchOpenLibraryMetadata(isbn) {
    const cleanIsbn = isbn.trim();
    let meta = {
      title: `Book ${cleanIsbn}`,
      description: "Imported via fast ISBN list.",
      authorName: "Unknown Author",
      genreName: "General",
      image: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
    };

    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`,
      );
      if (res.ok) {
        const data = await res.json();
        const info = data[`ISBN:${cleanIsbn}`];
        if (info) {
          meta.title = info.title || meta.title;
          meta.authorName = info.authors?.[0]?.name || meta.authorName;

          if (info.subjects && info.subjects.length > 0) {
            const validSubjects = info.subjects
              .map((s) => s.name)
              .filter(
                (s) =>
                  !s.toLowerCase().includes("accessible") &&
                  !s.toLowerCase().includes("daisy"),
              );
            meta.genreName =
              validSubjects.length > 0
                ? validSubjects[0]
                : info.subjects[0].name;
          }
        }
      }
    } catch (err) {
      console.warn(`Could not fetch OpenLibrary data for ISBN ${cleanIsbn}`);
    }
    return meta;
  }

  // Mode 2: Smart Hybrid (Authenticated Google Books -> OpenLibrary Cover Fallback)
  async function fetchTitleAuthorMetadata(title, author) {
    const defaultMeta = {
      description: "No description provided.",
      genreName: "General",
      image: "https://placehold.co/400x600/1e293b/ffffff?text=No+Cover",
    };

    let meta = { ...defaultMeta };
    const googleQuery = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;

    // 1. Authenticated Google Books Request (No more 429 IP Bans!)
    try {
      const fetchUrl = GOOGLE_BOOKS_API_KEY
        ? `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=1`
        : `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&maxResults=1`;

      const gbRes = await fetch(fetchUrl);

      if (gbRes.ok) {
        const data = await gbRes.json();
        if (data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo;

          meta.description = info.description || meta.description;
          meta.genreName = info.categories?.[0] || meta.genreName;

          const coverImage =
            info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
          if (coverImage) {
            meta.image = coverImage.replace("http:", "https:");
          }
        }
      } else {
        console.warn(`Google API returned status: ${gbRes.status}`);
      }
    } catch (err) {
      console.warn("Google Books fetch failed. Falling back to OpenLibrary.");
    }

    // 2. OpenLibrary Fallback (Only needed if Google is missing the cover)
    if (meta.image === defaultMeta.image) {
      try {
        const olQuery = encodeURIComponent(`${title} ${author}`);
        const olRes = await fetch(
          `https://openlibrary.org/search.json?q=${olQuery}&limit=3`,
        );

        if (olRes.ok) {
          const data = await olRes.json();
          if (data.docs && data.docs.length > 0) {
            const docWithCover = data.docs.find((d) => d.cover_i);

            // Rescue missing Cover Image
            if (docWithCover) {
              meta.image = `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-L.jpg`;
            }
          }
        }
      } catch (err) {
        console.warn("OpenLibrary fallback failed.");
      }
    }

    return meta;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgressText("Parsing CSV file...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const formattedBooks = [];

        try {
          if (importType === "isbn") {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const isbn = row.isbn || row.ISBN;
              if (!isbn) continue;

              setProgressText(
                `Fetching book (${i + 1}/${rows.length}): ISBN ${isbn.trim()}...`,
              );
              const meta = await fetchOpenLibraryMetadata(isbn);

              formattedBooks.push({
                title: meta.title,
                description: meta.description,
                price: parseFloat(row.price || row.Price || 500),
                stock: parseInt(row.stock || row.Stock || 10, 10),
                discountPercentage: parseFloat(
                  row.discount || row.discountPercentage || 0,
                ),
                image: meta.image,
                externalAuthor: meta.authorName,
                externalGenre: meta.genreName,
              });

              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } else {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const title = row.title || row.Title;
              const author = row.author || row.Author;
              if (!title || !author) continue;

              let description = row.description || row.Description;
              let genre = row.genre || row.Genre;
              let image = row.image || row.Image;

              if (!description || !genre || !image) {
                setProgressText(
                  `Auto-filling details (${i + 1}/${rows.length}): ${title}...`,
                );
                const autoMeta = await fetchTitleAuthorMetadata(title, author);
                if (!description) description = autoMeta.description;
                if (!genre) genre = autoMeta.genreName;
                if (!image) image = autoMeta.image;
              }

              formattedBooks.push({
                title,
                description,
                price: parseFloat(row.price || row.Price || 0),
                stock: parseInt(row.stock || row.Stock || 0, 10),
                discountPercentage: parseFloat(
                  row.discount || row.discountPercentage || 0,
                ),
                image,
                externalAuthor: author,
                externalGenre: genre,
              });

              // With an API key, we can drop the delay to just 500ms making uploads super fast!
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          setProgressText("Uploading books to database...");
          const token = sessionStorage.getItem("token");

          await axios.post(
            `${API_URL}/books/bulk`,
            { books: formattedBooks },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          toast.success(
            `Successfully imported ${formattedBooks.length} books!`,
          );
          navigate("/books");
        } catch (error) {
          console.error(error);
          toast.error("Bulk upload processing failed.");
        } finally {
          setUploading(false);
          setProgressText("");
        }
      },
      error: (err) => {
        toast.error("Error reading CSV file.");
        setUploading(false);
      },
    });
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-light border shadow-sm mb-4"
      >
        <FaArrowLeft className="me-2" /> Back
      </button>

      <div className="card shadow-sm border-0 p-4">
        <h2 className="fw-bold mb-3">
          <FaFileCsv className="me-2 text-primary" /> Bulk CSV Book Importer
        </h2>
        <p className="text-muted">
          Import books via CSV using high-speed OpenLibrary CDN covers and
          metadata.
        </p>

        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${importType === "isbn" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setImportType("isbn")}
          >
            Mode 1: ISBN List
          </button>
          <button
            type="button"
            className={`btn ${importType === "full" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setImportType("full")}
          >
            Mode 2: Smart Hybrid
          </button>
        </div>

        <div className="bg-light p-3 rounded mb-4 border small">
          {importType === "isbn" ? (
            <>
              <strong>Mode 1 Columns:</strong>
              <p className="mb-1 font-monospace text-secondary">
                isbn, price, stock, discount
              </p>
            </>
          ) : (
            <>
              <strong>Mode 2 Columns:</strong>
              <p className="mb-1 font-monospace text-secondary">
                title, author, price, stock, discount, description, genre, image
              </p>
            </>
          )}
        </div>

        {uploading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <h5 className="fw-bold">{progressText}</h5>
            <p className="text-muted small">Please do not close this window.</p>
          </div>
        ) : (
          <div
            className="border border-2 border-dashed rounded p-5 text-center bg-white"
            style={{ cursor: "pointer", position: "relative" }}
          >
            <FaCloudUploadAlt size={50} className="text-primary mb-3" />
            <h5 className="fw-bold">Drag and drop your CSV file here</h5>
            <p className="text-muted small mb-3">
              or click to browse from your computer
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                opacity: 0,
                position: "absolute",
                cursor: "pointer",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
