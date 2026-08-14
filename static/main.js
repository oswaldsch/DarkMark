async function saveNote() {
  const noteTitleInput = document.getElementById("noteTitleInput")
  const noteContentInput = document.getElementById("noteContentInput")
  const dialog = document.getElementById("newNoteModal")
  const payload = {
    title: noteTitleInput.value,
    content: noteContentInput.value
  }

  try {
    const response = await fetch("/api/new_note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Created new note:", result);
    dialog.close()
  } catch (error) {
    console.error("Error creating new note:", error);
  }
}

async function getNotes() {
  try {
    const response = await fetch("/api/notes")
    const { notes } = await response.json()
    const noteArea = document.getElementById("noteArea")
    notes.forEach((note, index) => {
      const noteCard = document.createElement("div")
      noteCard.classList.add("note-card")
      noteCard.innerHTML = `<h1 class="note-title">${note.title}</h1><div class="note-desc">${marked.parse(note.content)}</div>`;
      noteArea.appendChild(noteCard);
    });
  }
  catch (error) {
    console.error("Error creating new note:", error);
  }
}

getNotes()
