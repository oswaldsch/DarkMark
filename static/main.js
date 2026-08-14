async function newNote() {
  const payload = {
    "title": "Testing",
    "content": "# This is a heading\nThis is a text"
  };

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
  } catch (error) {
    console.error("Error creating new note:", error);
  }
}
