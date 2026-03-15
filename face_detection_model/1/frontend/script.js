const API_URL = 'http://127.0.0.1:5000/api';

let currentStream = null;

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('section').forEach(el => el.classList.remove('active'));

    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'register-section') {
        startCamera('reg-video');
    } else if (sectionId === 'identify-section') {
        startCamera('id-video');
    } else {
        stopCamera();
    }
}

async function startCamera(videoId) {
    stopCamera(); // Stop any existing stream
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById(videoId);
        video.srcObject = currentStream;
    } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera. Please allow permissions.");
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

// Capture Logic
function captureImage(videoId, canvasId) {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Show static image in video element for preview effect (optional)
    // video.srcObject = null;
    // video.poster = canvas.toDataURL('image/jpeg');

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/jpeg');
    });
}

// Registration
const regCaptureBtn = document.getElementById('reg-capture-btn');
const regRetakeBtn = document.getElementById('reg-retake-btn');
const regCanvas = document.getElementById('reg-canvas');
const regVideo = document.getElementById('reg-video');
let capturedRegBlob = null;

regCaptureBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    capturedRegBlob = await captureImage('reg-video', 'reg-canvas');
    regVideo.classList.add('hidden');
    regCanvas.classList.remove('hidden');
    regCaptureBtn.classList.add('hidden');
    regRetakeBtn.classList.remove('hidden');
});

regRetakeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    capturedRegBlob = null;
    regVideo.classList.remove('hidden');
    regCanvas.classList.add('hidden');
    regCaptureBtn.classList.remove('hidden');
    regRetakeBtn.classList.add('hidden');
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!capturedRegBlob) {
        alert("Please capture a photo first!");
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('reg-name').value);
    formData.append('age', document.getElementById('reg-age').value);
    formData.append('bio', document.getElementById('reg-bio').value);
    formData.append('image', capturedRegBlob, 'capture.jpg');

    const btn = document.querySelector('.submit-btn');
    const originalText = btn.innerText;
    btn.innerText = "Registering...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (response.ok) {
            alert("Registration Successful!");
            showSection('mode-selection');
            document.getElementById('register-form').reset();
            regRetakeBtn.click(); // Reset camera view
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        console.error(err);
        alert("Network error.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Identification
const idScanBtn = document.getElementById('id-scan-btn');

idScanBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const idCanvas = document.getElementById('id-canvas');
    const idVideo = document.getElementById('id-video');

    const blob = await captureImage('id-video', 'id-canvas');

    // Freeze UI
    idScanBtn.innerText = "Analyzing...";
    idScanBtn.classList.remove('pulse');
    idVideo.style.opacity = "0.5";

    const formData = new FormData();
    formData.append('image', blob, 'query.jpg');

    try {
        const response = await fetch(`${API_URL}/identify`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.match) {
            showResult(result.profile);
        } else {
            alert(result.message || result.error || "No match found.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error occurred.");
    } finally {
        resetIdentification();
    }
});

// File Upload Logic for Identification
const idUploadBtn = document.getElementById('id-upload-btn');
const idFileInput = document.getElementById('id-file-input');

idUploadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    idFileInput.click();
});

idFileInput.addEventListener('change', async (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    const idVideo = document.getElementById('id-video');
    const idScanBtn = document.getElementById('id-scan-btn');

    // UI Updates
    idScanBtn.innerText = "Analyzing...";
    idScanBtn.classList.remove('pulse');
    idVideo.style.opacity = "0.5";
    idUploadBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', file, 'upload.jpg');

    try {
        const response = await fetch(`${API_URL}/identify`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (response.ok && result.match) {
            showResult(result.profile);
        } else {
            alert(result.message || result.error || "No match found.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error occurred.");
    } finally {
        resetIdentification();
        // Reset file input so same file can be selected again if needed
        idFileInput.value = '';
        idUploadBtn.disabled = false;
    }
});

function resetIdentification() {
    const idVideo = document.getElementById('id-video');
    idScanBtn.innerText = "Scan Face";
    idScanBtn.classList.add('pulse');
    idVideo.style.opacity = "1";
}

function showResult(profile) {
    document.getElementById('res-name').innerText = profile.name;
    document.getElementById('res-age').innerText = profile.age;
    document.getElementById('res-bio').innerText = profile.bio;

    // Use the image URL returned from backend
    document.getElementById('res-image').src = profile.image_path;

    // Fallback if load fails (optional, logical addition for robustness)
    document.getElementById('res-image').onerror = function () {
        this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name) + '&background=random';
    };

    document.getElementById('result-overlay').classList.remove('hidden');
}

function closeResult() {
    document.getElementById('result-overlay').classList.add('hidden');
}
