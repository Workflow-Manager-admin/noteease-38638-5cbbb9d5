import React, { useState, useRef } from "react";
import "./MainContainer.css";

// Utility for generating unique IDs (for demo/local use)
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Predefined categories (can be extended)
const DEFAULT_CATEGORIES = ["All", "Personal", "Work", "Ideas", "Other"];

// PUBLIC_INTERFACE
function MainContainer() {
  // Local state for notes and UI
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null); // note.id or null
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("new"); // "new" or "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", category: "Personal" });

  // To restore focus after closing modal
  const fabRef = useRef();

  // Filter notes by category and search
  const filteredNotes = notes
    .filter(note =>
      filterCategory === "All" || note.category === filterCategory
    )
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Find selected note object for editing
  const selectedNote = notes.find(note => note.id === selectedNoteId);

  // PUBLIC_INTERFACE
  // Open modal to create a new note
  function handleAddNewNote() {
    setNoteForm({ title: "", content: "", category: categories[1] || "Personal" });
    setModalMode("new");
    setModalOpen(true);
  }

  // PUBLIC_INTERFACE
  // Open modal to edit a note
  function handleEditNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNoteForm({ title: note.title, content: note.content, category: note.category });
      setSelectedNoteId(noteId);
      setModalMode("edit");
      setModalOpen(true);
    }
  }

  // PUBLIC_INTERFACE
  // Delete a note by id
  function handleDeleteNote(noteId) {
    if (window.confirm("Delete this note?")) {
      setNotes(notes => notes.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    }
  }

  // PUBLIC_INTERFACE
  // Handle modal form changes
  function handleFormChange(e) {
    const { name, value } = e.target;
    setNoteForm(form => ({ ...form, [name]: value }));
  }

  // PUBLIC_INTERFACE
  // Save (create or update) note from modal
  function handleModalSave() {
    if (!noteForm.title.trim()) return;
    if (modalMode === "new") {
      // Create note
      setNotes(notes => [
        ...notes,
        { ...noteForm, id: generateId(), createdAt: Date.now() }
      ]);
    } else if (modalMode === "edit" && selectedNote) {
      // Edit note
      setNotes(notes =>
        notes.map(n =>
          n.id === selectedNote.id ? { ...n, ...noteForm } : n
        )
      );
    }
    closeModal();
  }

  // PUBLIC_INTERFACE
  // Close modal & reset UI
  function closeModal() {
    setModalOpen(false);
    setSelectedNoteId(null);
    setNoteForm({ title: "", content: "", category: categories[1] || "Personal" });
    setTimeout(() => {
      if (fabRef.current) fabRef.current.focus();
    }, 200);
  }

  // PUBLIC_INTERFACE
  // Add a custom category (optional enhancement)
  function handleAddCategory() {
    const cat = prompt("Enter new category name:");
    if (
      cat &&
      cat.trim() &&
      !categories.includes(cat.trim()) &&
      /^[\w\s]+$/.test(cat)
    ) {
      setCategories([...categories, cat.trim()]);
    }
  }

  // PUBLIC_INTERFACE
  // Render a single note card
  function NoteCard({ note }) {
    const snippet = (note.content.length > 80)
      ? note.content.substring(0, 80) + "…"
      : note.content;
    return (
      <div className="note-card">
        <div className="note-card-header">
          <span className="note-title">{note.title}</span>
          <span className="note-category"
            style={{
              background: note.category === "Personal"
                ? "#4A90E2" : note.category === "Work"
                ? "#F5A623" : "#aaa"
            }}>
            {note.category}
          </span>
        </div>
        <div className="note-snippet">{snippet}</div>
        <div className="note-card-actions">
          <button className="note-btn edit" onClick={() => handleEditNote(note.id)}>Edit</button>
          <button className="note-btn delete" onClick={() => handleDeleteNote(note.id)}>Delete</button>
        </div>
      </div>
    );
  }

  // UI render
  return (
    <div className="noteease-main-container">
      <div className="noteease-topbar">
        <div className="main-logo">📝 NoteEase</div>
        <div className="topbar-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search notes"
          />
          <div className="category-filter">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              className="add-category-btn"
              title="Add category"
              onClick={handleAddCategory}
            >+</button>
          </div>
        </div>
      </div>

      <div className="notes-list-wrapper">
        {filteredNotes.length === 0 ? (
          <div className="no-notes">No notes found.</div>
        ) : (
          <div className="notes-list">
            {filteredNotes
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="floating-action-btn"
        aria-label="Create note"
        ref={fabRef}
        onClick={handleAddNewNote}
        tabIndex={0}
        title="Create a new note"
      >
        +
      </button>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{modalMode === "new" ? "Create Note" : "Edit Note"}</h2>
            <input
              name="title"
              className="modal-input"
              autoFocus
              type="text"
              placeholder="Title"
              value={noteForm.title}
              onChange={handleFormChange}
              maxLength={48}
              aria-label="Note Title"
            />
            <textarea
              name="content"
              className="modal-textarea"
              placeholder="Write your note…"
              value={noteForm.content}
              onChange={handleFormChange}
              minLength={1}
              rows={5}
              aria-label="Note Content"
            />
            <div className="modal-actions">
              <select
                name="category"
                value={noteForm.category}
                onChange={handleFormChange}
                className="modal-select"
                aria-label="Note Category"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                className="note-btn save"
                onClick={handleModalSave}
                disabled={!noteForm.title.trim()}
              >Save</button>
              <button className="note-btn cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContainer;
