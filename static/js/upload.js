const uploadBox = document.getElementById('dragDropBox');
const fileInput = document.getElementById('fileInput');
let selectedFile = null;

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function validateFileType(file) {
  const validTypes = ['.txt', '.pdf'];
  const fileName = file.name.toLowerCase();
  return validTypes.some(type => fileName.endsWith(type));
}

function resetUploadBox() {
  uploadBox.innerHTML = `
    <strong>Drag and drop your file here</strong><br />
    <span>or click to select</span>
  `;
  uploadBox.classList.remove('selected', 'dragover');
  selectedFile = null;
  fileInput.value = '';
}

function handleDrop(e) {
  preventDefaults(e);
  uploadBox.classList.remove('dragover');

  const dt = e.dataTransfer;
  const file = dt.files[0];

  if (!file) return;

  if (!validateFileType(file)) {
    alert('Please upload only .txt or .pdf files');
    return;
  }

  selectedFile = file;
  displayFileName(file.name);
}

function displayFileName(fileName) {
  uploadBox.innerHTML = `
    <strong>${fileName}</strong>
    <br>
    <span class="remove-file">(Click to remove)</span>
  `;
  uploadBox.classList.add('selected');
}

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Handle drag and drop events on the upload box
uploadBox.addEventListener('dragenter', () => {
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragover', () => {
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', (e) => {
  // Only remove the dragover class if we're leaving the upload box
  // (not entering a child element)
  if (!uploadBox.contains(e.relatedTarget)) {
    uploadBox.classList.remove('dragover');
  }
});

uploadBox.addEventListener('drop', handleDrop);

// Handle click on upload box
uploadBox.addEventListener('click', () => {
  if (uploadBox.classList.contains('selected')) {
    resetUploadBox();
  } else {
    fileInput.click();
  }
});

// Handle file input change
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    if (!validateFileType(file)) {
      alert('Please upload only .txt or .pdf files');
      resetUploadBox();
      return;
    }
    selectedFile = file;
    displayFileName(file.name);
  }
});

// Process the file and save it
function processFile() {
  if (!selectedFile) {
    alert('No file selected. Please choose a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  })
  .then(data => {
    location.reload(); // Refresh to show the new file in the list
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error uploading file');
    resetUploadBox();
  });
}

// Load a saved file
function loadFile(filename) {
  fetch(`/files/${filename}`)
    .then(response => response.text())
    .then(content => {
      const minutes = parseInt(document.getElementById('minutes').value) || 0;
      const seconds = parseInt(document.getElementById('seconds').value) || 0;
      const totalSeconds = minutes * 60 + seconds;
      
      if (totalSeconds < 0) {
        alert('Please enter a valid time limit');
        return;
      }
      
      // Add time limit to URL parameters
      const params = new URLSearchParams({
        content: content,
        timeLimit: totalSeconds
      });
      
      window.location.href = `/typing?${params.toString()}`;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error loading file');
    });
}

// Delete a saved file
function deleteFile(filename) {
  if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
    return;
  }

  fetch(`/files/${filename}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Delete failed');
    }
    location.reload(); // Refresh to update the file list
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting file');
  });
} 