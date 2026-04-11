import { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { FiX, FiPlus } from 'react-icons/fi';

const NotesModal = ({ lead, onClose, onRefresh }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await notesAPI.getForLead(lead.id);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [lead.id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await notesAPI.add(lead.id, newNote);
      setNewNote('');
      fetchNotes();
      onRefresh(); // refresh lead list (optional)
    } catch (err) {
      alert('Failed to add note');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold">Notes for {lead.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <FiX size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : notes.length === 0 ? (
            <p className="text-gray-500 text-center">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-gray-100 dark:bg-dark-100 p-3 rounded-lg">
                <p className="text-sm">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.created_by} • {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a follow-up note..."
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={addNote}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
            >
              <FiPlus className='cursor-pointer' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;