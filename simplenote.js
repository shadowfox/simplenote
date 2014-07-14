// True if this browser supports local storage
// See: http://diveintohtml5.info/detect.html#storage
function localStorageSupport() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
}

// Handles all note functionality
var SimpleNote = {
    prefix: 'simplenote_', // We'll only pay attention to keys prefixed with this string

    notepadId: "notepad",
    sidebarId: "notes-list",

    // Initialise the application
    init: function() {
        this.initEvents();

        document.getElementById(this.sidebarId).style.height = (window.screen.availHeight - 200) + 'px';

        // If there are no notes, create one
        if (this.getNoteCount() < 1) {
            this.addNote();
        }

        // Build the sidebar list and display the active note
        this.refreshSidebar();
        this.showActiveNote();
    },

    // Set up the following application events:
    // - Updates to the input textarea element
    // - Before page resource unload (eg. tab close)
    // - When the sidebar list elements are clicked
    // - When the add/delete links are clicked
    initEvents: function() {
        // Textarea updates
        var textarea = document.getElementById("notepad");
        if (textarea.addEventListener) {
            textarea.addEventListener("input", this.updateActiveNote, false);
        } else if (textarea.attachEvent) {
            textarea.attachEvent('onpropertychange', this.updateActiveNote);
        }

        // Tab unload
        window.addEventListener("beforeunload", this.updateActiveNote, false);

        // Sidebar selection
        document.getElementById("notes-list").addEventListener("click", function(event) {
            var target = getEventTarget(event);
            // We could have also clicked on the text, so make sure we always have the parent li
            if (target.nodeName !== "LI") {
                target = target.parentNode;
            }

            SimpleNote.setActiveNote(target.id);
        });

        // Add/delete links
        document.getElementById("add-note").addEventListener("click", this.addNote, false);
        document.getElementById("delete-note").addEventListener("click", this.deleteNote, false);
        document.getElementById("delete-all").addEventListener("click", this.deleteAllNotes, false);
    },

    // Retrieve the current active note from localstorage
    // A note will be nominted if no active note exists
    getActiveNote: function() {
        var activeNoteId = window.localStorage.getItem(SimpleNote.prefix + "activeNote");
        if (!activeNoteId) {
            // If we don't have a current note, nominate the last one in the list, or create a new one
            var count = SimpleNote.getNoteCount();

            if (count > 0) {
                // Javascript objects are actually unordered, but I'm not concered here
                activeNoteId = Object.keys(SimpleNote.getNotes())[count - 1];
                SimpleNote.setActiveNote(activeNoteId);
            } else {
                // There are no notes available, so we should create one.
                return SimpleNote.addNote();
            }
        }

        return activeNoteId;
    },

    // Save the given note ID as the current active note,
    // and reload the interface to reflect the change
    setActiveNote: function(noteId) {
        window.localStorage.setItem(SimpleNote.prefix + "activeNote", noteId);

        SimpleNote.showActiveNote();
        return noteId;
    },

    // Reloads the interface to display the active note
    showActiveNote: function() {
        var activeNote = SimpleNote.getActiveNote();
        var content = window.localStorage.getItem(activeNote);

        document.getElementById(SimpleNote.notepadId).value = content;
        SimpleNote.refreshSidebar();
    },

    // Empty and then rebuild the list of notes from localstorage
    refreshSidebar: function() {
        document.getElementById(SimpleNote.sidebarId).innerHTML = "";

        var template = '<li id="{0}" {1}><strong>{2}</strong><span>{3}</span></li>';
        var activeNoteId = SimpleNote.getActiveNote();

        var notes = SimpleNote.getNotes();
        for (var key in notes) {
            if (!notes.hasOwnProperty(key)) {
                continue;
            }

            var unixStamp = parseInt(key.replace(SimpleNote.prefix, ''));
            document.getElementById(SimpleNote.sidebarId).innerHTML += template.format(
                key,
                key === activeNoteId ? 'class="current"' : '',
                new Date(unixStamp).getTimestamp(),
                noteSummary(notes[key])
            );
        }
    },

    // Gets a list of notes from local storage
    getNotes: function() {
        var key, note;
        var notes = {};

        for (var i = 0; i < window.localStorage.length; i++) {
            key = window.localStorage.key(i);

            if (!key.startsWith(SimpleNote.prefix)) {
                // Not related to this application
                continue;
            }

            if (key === SimpleNote.prefix + "activeNote") {
                // Is not a note
                continue;
            }

            notes[key] = window.localStorage.getItem(key);
        }

        return notes;
    },

    // Gets a count of all notes
    getNoteCount: function() {
        return Object.keys(this.getNotes()).length;
    },

    // Called on textarea events
    // Updates the local storage value for the active note
    updateActiveNote: function(e) {
        var activeNoteId = SimpleNote.getActiveNote();
        var text =  document.getElementById("notepad").value;

        // Wrap this as local storage will have quota limits
        try {
            window.localStorage.setItem(activeNoteId, text);
        } catch (e) {
            alert("LocalStorage limitation: " + e.message);
        }

        // Also set the sidebar item
        var spanText = document.querySelector("li#" + activeNoteId + " span");
        if (spanText != null) {
            spanText.innerHTML = noteSummary(text);
        }
    },

    // Create a new note and set it as active
    addNote: function() {
        var noteId = new Date().getTime();
        window.localStorage.setItem(SimpleNote.prefix + noteId, '(type here)');

        return SimpleNote.setActiveNote(SimpleNote.prefix + noteId);
    },

    // Delete the active note from local storage
    // and reload the interface
    deleteNote: function() {
        var noteId = SimpleNote.getActiveNote();
        window.localStorage.removeItem(noteId);
        window.localStorage.removeItem(SimpleNote.prefix + "activeNote");
        SimpleNote.showActiveNote();

    },

    // Delete all notes from local storage
    // and reload the interface
    deleteAllNotes: function() {
        if (!window.confirm("Really delete all notes?")) {
            return;
        }

        var notes = SimpleNote.getNotes();
        for (var key in notes) {
            if (!notes.hasOwnProperty(key)) {
                continue;
            }

            window.localStorage.removeItem(key);
        }

        window.localStorage.removeItem(SimpleNote.prefix + "activeNote");
        SimpleNote.showActiveNote();
    },
}

window.onload = function() {
    if (!localStorageSupport()) {
        document.getElementById("main").innerHTML = '<p id="error">Sorry, this browser does not appear to support local storage!</p>';
        throw { name: 'FatalError', message: 'Local storage support required' };
    }

    SimpleNote.init();
}
