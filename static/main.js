let debounceTimer

async function newNote() {
  try {
    const response = await fetch("/api/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    getNotes()
    changeCurrentNote({id: result["id"], title: "", content: ""})
  } catch (error) {
    console.error("Error creating new note:", error);
  }
}

async function saveNote() {
  const noteTitleInput = document.getElementById("noteTitleInput")
  const noteContentInput = document.getElementById("noteContentInput")
  const noteID = parseInt(document.getElementById("noteId").innerText)
  const payload = {
    id: noteID,
    title: noteTitleInput.value,
    content: noteContentInput.value
  }

  try {
    const response = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    getNotes()
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

function debouncedSave() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(saveNote, 500)
}

function changeCurrentNote(note) {
  const noteEditArea = document.getElementById("noteEditArea")
  noteEditArea.replaceChildren()

  const idSpan = document.createElement("span")
  idSpan.id = "noteId"
  idSpan.hidden = true
  idSpan.textContent = note.id

  const titleInput = document.createElement("input")
  titleInput.id = "noteTitleInput"
  titleInput.value = note.title
  titleInput.oninput = debouncedSave
  titleInput.placeholder = "Note title"

  const contentArea = document.createElement("textarea")
  contentArea.id = "noteContentInput"
  contentArea.textContent = note.content
  contentArea.oninput = () => {
    debouncedSave()
  }
  contentArea.placeholder = "Note content"

  noteEditArea.append(idSpan, titleInput, contentArea)
}

async function getNotes() {
  try {
    const response = await fetch("/api/notes")
    const { notes } = await response.json()
    const noteArea = document.getElementById("noteArea")
    noteArea.replaceChildren()
    notes.forEach((note, index) => {
      const noteCard = document.createElement("div")
      noteCard.classList.add("note-card")
      noteCard.innerHTML = `<h2 class="note-title">${note.title}</h1><div class="note-delete" id="noteDeleteBtn"><img src="/assets/trash.svg"></svg></div>`;
      noteCard.onclick = () => {
        changeCurrentNote(note)
      }
      noteArea.appendChild(noteCard);
    });
  }
  catch (error) {
    console.error("Error creating new note:", error);
  }
}

getNotes()
