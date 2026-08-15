from fastapi import FastAPI  # noqa: I001
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import sqlite3


app = FastAPI()

class NoteData(BaseModel):
    title: str
    content: str
    id: int

def init_db():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor = cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )""")
    conn.commit()
    conn.close()

init_db()

@app.get("/")
def index():
    return FileResponse("static/index.html")

@app.post("/api/new")
def new_note():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()

    cursor = cursor.execute("INSERT INTO notes (title, content) VALUES (?, ?)", ("", ""))

    note_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "success", "id": note_id}

@app.post("/api/save")
def save_note(note: NoteData):
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()

    cursor = cursor.execute("UPDATE notes SET title = ?, content = ? WHERE id = ?", (note.title, note.content, note.id))

    conn.commit()
    conn.close()

    return {"status": "success"}

@app.get("/api/notes")
def get_notes():
    conn = sqlite3.connect("notes.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor = cursor.execute("SELECT * FROM notes")
    rows = cursor.fetchall()
    conn.close()

    notes = [dict(row) for row in rows]
    return {"notes": notes}

app.mount("/", StaticFiles(directory="static", html=True), name="static")
