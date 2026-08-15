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

function togglePreview(new_state, note) {
  const contentArea = document.getElementById("noteContentInput")
  if (new_state) {
    const newContentArea = document.createElement("div")
    newContentArea.id = "noteContentInput"
    newContentArea.innerHTML = marked.parse(contentArea.value)
    newContentArea.dataset.raw = contentArea.value

    contentArea.replaceWith(newContentArea)
  }
  else {
    const newContentArea = document.createElement("textarea")
    newContentArea.id = "noteContentInput"
    newContentArea.textContent = contentArea.dataset.raw
    newContentArea.oninput = () => {
      debouncedSave()
    }
    newContentArea.placeholder = "Note content"

    contentArea.replaceWith(newContentArea)
  }
}

function changeCurrentNote(note) {
  const noteEditArea = document.getElementById("noteEditArea")
  noteEditArea.replaceChildren()

  const idSpan = document.createElement("span")
  idSpan.id = "noteId"
  idSpan.hidden = true
  idSpan.textContent = note.id

  const titleGroup = document.createElement("div")
  titleGroup.classList.add("title-group")

  const titleInput = document.createElement("input")
  titleInput.id = "noteTitleInput"
  titleInput.value = note.title
  titleInput.oninput = debouncedSave
  titleInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      contentArea.focus()
    }
  }
  titleInput.placeholder = "Note title"
  titleGroup.append(titleInput)

  const previewToggleGroup = document.createElement("div")
  previewToggleGroup.classList.add("toggle-group")

  const rawBtn = document.createElement("button")
  rawBtn.classList.add("toggle-btn", "active")
  const rawImg = document.createElement("img")
  rawImg.src = "/assets/raw.svg"
  rawBtn.append(rawImg)

  const previewBtn = document.createElement("button")
  previewBtn.classList.add("toggle-btn")
  const previewImg = document.createElement("img")
  previewImg.src = "/assets/preview.svg"
  previewBtn.append(previewImg)

  rawBtn.onclick = () => { rawBtn.classList.add("active"); previewBtn.classList.remove("active"); togglePreview(false, note) }
  previewBtn.onclick = () => { previewBtn.classList.add("active"); rawBtn.classList.remove("active"); togglePreview(true, note) }

  previewToggleGroup.append(rawBtn, previewBtn)
  titleGroup.append(previewToggleGroup)

  const contentArea = document.createElement("textarea")
  contentArea.id = "noteContentInput"
  contentArea.textContent = note.content
  contentArea.oninput = () => {
    debouncedSave()
  }
  contentArea.placeholder = "Note content"

  noteEditArea.append(idSpan, titleGroup, contentArea)
}

async function deleteNote(id) {
  await fetch(`/api/delete/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  getNotes()
}

async function getNotes() {
  try {
    const response = await fetch("/api/notes")
    const { notes } = await response.json()
    const noteArea = document.getElementById("noteArea")
    noteArea.replaceChildren()
    notes.forEach((note) => {
      const noteCard = document.createElement("div")
      noteCard.classList.add("note-card")
      noteCard.onclick = () => changeCurrentNote(note)

      const noteTitle = document.createElement("h2")
      noteTitle.classList.add("note-title")
      noteTitle.textContent = note.title

      const deleteBtn = document.createElement("div")
      deleteBtn.id = "noteDeleteBtn"
      deleteBtn.classList.add("note-delete")
      deleteBtn.onclick = (e) => {
        e.stopPropagation()
        deleteNote(note.id)
      }

      const trashImg = document.createElement("img")
      trashImg.src = "/assets/trash.svg"

      deleteBtn.appendChild(trashImg)
      noteCard.append(noteTitle, deleteBtn)
      noteArea.appendChild(noteCard)
    })
  } catch (error) {
    console.error("Error fetching notes:", error)
  }
}

getNotes()
