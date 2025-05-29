let data = [];
const inputBox = document.getElementById("input-box");


inputBox.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

const listContainer = document.getElementById("list-container");

const createDraftBtn = document.getElementById("create-draft-btn");
const useDraftBtn = document.getElementById("use-draft-btn");

function addTask() {
  const taskText = inputBox.value.trim();
  if (taskText === "") {
    alert("You must write something!");
    return;
  }

  let li = document.createElement("li");
  li.textContent = taskText;

  let span = document.createElement("span");
  span.textContent = "\u00d7";
  li.appendChild(span);

  listContainer.appendChild(li);
  inputBox.value = "";

  saveData();
  updateDataArray();
}

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      saveData();
      updateDataArray();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveData();
      updateDataArray();
    }
  },
  false
);

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  const saved = localStorage.getItem("data");
  if (saved) {
    listContainer.innerHTML = saved;
    updateDataArray();
  }
}

function updateDataArray() {
  data = [];
  listContainer.querySelectorAll("li").forEach((li) => {
    data.push(li.textContent.replace("\u00d7", "").trim());
  });
  // console.log(data);
}

showTask();

createDraftBtn.addEventListener("click", () => {
  if (data.length === 0) {
    alert("No tasks to save as draft!");
    return;
  }

  const draftTitle = prompt("Enter a title for your draft:");
  if (!draftTitle) {
    alert("Draft title is required.");
    return;
  }

  let drafts = JSON.parse(localStorage.getItem("drafts") || "{}");

  // If draft title exists, ask for overwrite
  if (drafts[draftTitle]) {
    const overwrite = confirm(
      `Draft "${draftTitle}" already exists. Overwrite?`
    );
    if (!overwrite) return;
  }

  drafts[draftTitle] = data;

  localStorage.setItem("drafts", JSON.stringify(drafts));
  alert(`Draft "${draftTitle}" saved!`);
});

useDraftBtn.addEventListener("click", () => {
  let drafts = JSON.parse(localStorage.getItem("drafts") || "{}");
  const draftTitles = Object.keys(drafts);

  if (draftTitles.length === 0) {
    alert("No drafts found!");
    return;
  }

  // Build list of drafts with numbers
  let draftListStr = "Drafts:\n\n";
  draftTitles.forEach((title, i) => {
    draftListStr += `${i + 1}. ${title}\n`;
  });
  draftListStr +=
    "\nChoose an action by typing:\nL <number> - Load draft\nE <number> - Edit draft\nD <number> - Delete draft";

  const input = prompt(draftListStr);
  if (!input) return;

  const parts = input.trim().split(" ");
  if (parts.length !== 2) {
    alert("Invalid input format.");
    return;
  }

  const action = parts[0].toUpperCase();
  const choiceNum = parseInt(parts[1]);

  if (
    isNaN(choiceNum) ||
    choiceNum < 1 ||
    choiceNum > draftTitles.length ||
    !["L", "E", "D"].includes(action)
  ) {
    alert("Invalid action or draft number.");
    return;
  }

  const draftKey = draftTitles[choiceNum - 1];

  if (action === "L") {
    // Load draft
    loadDraft(draftKey, drafts[draftKey]);
  } else if (action === "D") {
    // Delete draft
    const confirmDel = confirm(`Are you sure you want to delete "${draftKey}"?`);
    if (confirmDel) {
      delete drafts[draftKey];
      localStorage.setItem("drafts", JSON.stringify(drafts));
      alert(`Draft "${draftKey}" deleted.`);
    }
  } else if (action === "E") {
    // Edit draft (change title and/or update tasks)
    editDraft(draftKey, drafts);
  }
});

function loadDraft(title, taskArray) {
  listContainer.innerHTML = "";
  taskArray.forEach((taskText) => {
    let li = document.createElement("li");
    li.textContent = taskText;

    let span = document.createElement("span");
    span.textContent = "\u00d7";
    li.appendChild(span);

    listContainer.appendChild(li);
  });
  updateDataArray();
  saveData();
  alert(`Draft "${title}" loaded!`);
}

function editDraft(oldTitle, drafts) {
  // Ask for new title
  const newTitle = prompt("Edit draft title:", oldTitle);
  if (!newTitle) {
    alert("Draft title cannot be empty.");
    return;
  }

  // Load draft tasks to the list
  loadDraft(oldTitle, drafts[oldTitle]);

  // Let user edit tasks now, then save with new title on confirm
  alert(
    'Now edit tasks in the list. When done, press OK to save changes under the new title.'
  );

  // After user clicks OK, update drafts
  updateDataArray(); // refresh `data` from current list

  // Remove old draft key if title changed
  if (newTitle !== oldTitle) {
    if (drafts[newTitle]) {
      const overwrite = confirm(
        `Draft "${newTitle}" already exists. Overwrite?`
      );
      if (!overwrite) {
        alert("Edit canceled.");
        return;
      }
    }
    delete drafts[oldTitle];
  }

  drafts[newTitle] = data;
  localStorage.setItem("drafts", JSON.stringify(drafts));
  alert(`Draft saved as "${newTitle}".`);
}