let debounceTimer
const menu = document.getElementById("popoverMenu");
const headingBtn = document.getElementById("headingBtn");
const headingMenu = document.getElementById("headingMenu");

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
    content: noteContentInput.innerText
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
    newContentArea.innerHTML = marked.parse(contentArea.innerText)
    newContentArea.dataset.raw = contentArea.innerText

    contentArea.replaceWith(newContentArea)
  }
  else {
    const newContentArea = document.createElement("div")
    newContentArea.id = "noteContentInput"
    newContentArea.contentEditable = true;
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

  const contentArea = document.createElement("div")
  contentArea.id = "noteContentInput"
  contentArea.contentEditable = true;
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
    if (notes.length == 0) {
      const placeholderText = document.createElement("h3")
      placeholderText.classList.add("placeholder-text")
      placeholderText.innerText = "No notes yet; Add one by clicking the button in the top right!"
      noteArea.append(placeholderText)
    }
  } catch (error) {
    console.error("Error fetching notes:", error)
  }
}

function getSelectionRange(element) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return { start: 0, end: 0 };

  const range = selection.getRangeAt(0);

  const preCaretRangeStart = range.cloneRange();
  preCaretRangeStart.selectNodeContents(element);
  preCaretRangeStart.setEnd(range.startContainer, range.startOffset);
  const start = preCaretRangeStart.toString().length;

  const preCaretRangeEnd = range.cloneRange();
  preCaretRangeEnd.selectNodeContents(element);
  preCaretRangeEnd.setEnd(range.endContainer, range.endOffset);
  const end = preCaretRangeEnd.toString().length;

  return { start, end };
}

function insertAtIndex(element, index, textToInsert) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let currentIndex = 0;
  let node = walker.nextNode();

  while (node) {
    const nodeLength = node.textContent.length;

    if (currentIndex + nodeLength >= index) {
      const offsetInNode = index - currentIndex;
      const before = node.textContent.slice(0, offsetInNode);
      const after = node.textContent.slice(offsetInNode);
      node.textContent = before + textToInsert + after;
      return;
    }
    currentIndex += nodeLength;
    node = walker.nextNode();
  }

  element.appendChild(document.createTextNode(textToInsert));
}

function getLineStart(text, index) {
  const lastBreak = text.lastIndexOf("\n", index - 1);
  return lastBreak === -1 ? 0 : lastBreak + 1;
}

function formatText(action) {
  const contentArea = document.getElementById("noteContentInput")
  const { start, end } = getSelectionRange(contentArea)
  if (action == "bold") {
    insertAtIndex(contentArea, start, "**");
    insertAtIndex(contentArea, end + 2, "**"); // After the first function ran it shifted the index
  } else if (action == "italic") {
    insertAtIndex(contentArea, start, "*");
    insertAtIndex(contentArea, end + 1, "*");
  } else if (action == "strikethrough") {
    insertAtIndex(contentArea, start, "~~");
    insertAtIndex(contentArea, end + 2, "~~");
  } else if (action === "heading") {
    const level = "#".repeat(arguments[1]) + " ";
    const lineStart = getLineStart(contentArea.innerText, start);
    insertAtIndex(contentArea, lineStart, level);
  }
  saveNote();
}

async function copySelection() {
  const contentArea = document.getElementById("noteContentInput")
  const { start, end } = getSelectionRange(contentArea);
    const selectedText = contentArea.innerText.slice(start, end);
  try {
    await navigator.clipboard.writeText(selectedText);
  } catch (e) {
    console.error("Copy failed:", e);
  }
}

async function pasteClipboard() {
  const contentArea = document.getElementById("noteContentInput")
  try {
    const clipboardText = await navigator.clipboard.readText();
    const { start, end } = getSelectionRange(contentArea);
    const text = contentArea.innerText;
    const newText = text.slice(0, start) + clipboardText + text.slice(end);
    contentArea.innerText = newText;
  } catch (e) {
    console.error("Paste failed:", e);
  }
}

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length === 0 || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  let rect = range.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    const rects = range.getClientRects();
    if (rects.length > 0) rect = rects[0];
  }

  if (rect.width === 0 && rect.height === 0) {
    return;
  }

  menu.style.display = "block";
  let topPosition = rect.top + window.scrollY - menu.offsetHeight - 8;
  let leftPosition = rect.left + window.scrollX + (rect.width / 2) - (menu.offsetWidth / 2);
  menu.style.top = `${topPosition}px`;
  menu.style.left = `${leftPosition}px`;
});

document.addEventListener("mousedown", (e) => {
  if (!menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

headingBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    headingMenu.classList.toggle("open");
});

headingMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-level]");
    if (!btn) return;
    const level = btn.dataset.level;
    formatText("heading", level);
    headingMenu.classList.remove("open");
});

document.addEventListener("mousedown", (e) => {
    if (!headingMenu.contains(e.target) && e.target !== headingBtn) {
        headingMenu.classList.remove("open");
    }
});

getNotes()
