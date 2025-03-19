const homePage = document.getElementById("homePage");
const cameraPage = document.getElementById("cameraPage");
const customizationPage = document.getElementById("customizationPage");
const finalPage = document.getElementById("finalPage");

const useCameraBtn = document.getElementById("useCamera");
const video = document.getElementById("cameraFeed");
const countdownDisplay = document.getElementById("countdown");
const dots = document.querySelectorAll(".dot");
const photostripPreview = document.getElementById("photostripPreview");
const photostripImage = document.getElementById("photostripImage");
const colorButtons = document.querySelectorAll(".color-btn");
const continueButton = document.getElementById("continueButton");

const finalPhotostripCanvas = document.getElementById("finalPhotostripCanvas");
const downloadButton = document.getElementById("downloadPhotostrip");

let photoCount = 0;
let takenPhotos = [];
let selectedColor = "";

// Function to hide all pages
function hideAllPages() {
    homePage.classList.add("hidden");
    cameraPage.classList.add("hidden");
    customizationPage.classList.add("hidden");
    finalPage.classList.add("hidden");
}

// Start Camera When Button Clicked
useCameraBtn.addEventListener("click", () => {
    hideAllPages(); // Hide all pages first
    cameraPage.classList.remove("hidden"); // Show only the camera page

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
    });

    startCountdown();
});


// Countdown Function
function startCountdown() {
    let count = 5;
    countdownDisplay.textContent = count;
    countdownDisplay.style.display = "block";

    let countdownInterval = setInterval(() => {
        count--;
        countdownDisplay.textContent = count;

        if (count === 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = "none";
            takePhoto();
        }
    }, 1000);
}

// Take Photo and Store It
function takePhoto() {
    if (photoCount < 3) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL("image/png");

        takenPhotos.push(imageData);
        localStorage.setItem("takenPhotos", JSON.stringify(takenPhotos));

        dots[photoCount].style.backgroundColor = "#38FD42";
        photoCount++;

        if (photoCount < 3) {
            setTimeout(startCountdown, 1000);
        } else {
            setTimeout(() => {
                cameraPage.classList.add("hidden");
                customizationPage.classList.remove("hidden");
            }, 1000);
        }
    }
}

// Change Photostrip Preview and Save Selected Color
colorButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        selectedColor = e.target.dataset.color;
        localStorage.setItem("selectedColor", selectedColor);
        photostripImage.src = `photostrips/${selectedColor}.png`;
        continueButton.classList.remove("hidden");

        colorButtons.forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
    });
});

// Generate Final Photostrip
function generateFinalPhotostrip() {
    takenPhotos = JSON.parse(localStorage.getItem("takenPhotos")) || [];
    selectedColor = localStorage.getItem("selectedColor");

    if (!selectedColor || takenPhotos.length < 3) {
        console.error("Missing photostrip color or images.");
        return;
    }

    const ctx = finalPhotostripCanvas.getContext("2d");
    const selectedPhotostrip = new Image();

    selectedPhotostrip.crossOrigin = "anonymous";
    selectedPhotostrip.src = `photostrips/${selectedColor}.png`;

    selectedPhotostrip.onload = function () {
        finalPhotostripCanvas.width = selectedPhotostrip.width;
        finalPhotostripCanvas.height = selectedPhotostrip.height;
        ctx.drawImage(selectedPhotostrip, 0, 0, selectedPhotostrip.width, selectedPhotostrip.height);

        const positions = [
            { x: 87, y: 138, width: 576, height: 657 },
            { x: 87, y: 946, width: 576, height: 657 },
            { x: 87, y: 1754, width: 576, height: 657 }
        ];

        let loadedImages = 0;

        takenPhotos.forEach((photo, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = photo;

            img.onload = function () {
                ctx.drawImage(img, positions[index].x, positions[index].y, positions[index].width, positions[index].height);
                loadedImages++;

                // 🔥 Fix: Force Canvas Update
                if (loadedImages === takenPhotos.length) {
                    finalPhotostripCanvas.style.display = "block"; 
                    finalPhotostripCanvas.style.visibility = "visible";
                    requestAnimationFrame(() => {}); // 🔄 Forces a re-render
                }
            };

            img.onerror = function () {
                console.error("Error loading image:", photo);
            };
        });
    };

    selectedPhotostrip.onerror = function () {
        console.error("Error loading photostrip image.");
    };
}

// Navigate to Final Page and Generate Photostrip
document.getElementById("continueButton").addEventListener("click", () => {
    customizationPage.classList.add("hidden");
    finalPage.classList.remove("hidden");
    
    generateFinalPhotostrip(); 

    setTimeout(() => {
        finalPhotostripCanvas.style.display = "block"; 
        finalPhotostripCanvas.style.visibility = "visible"; 
    }, 500);
});

// Download Final Photostrip
downloadButton.addEventListener("click", () => {
    setTimeout(() => {
        try {
            const link = document.createElement("a");
            link.download = "Photostrip.png";
            link.href = finalPhotostripCanvas.toDataURL("image/png");
            link.click();
        } catch (error) {
            console.error("❌ Error downloading photostrip:", error);
        }
    }, 500);
});
// Flash effect function
function flashEffect() {
    video.style.transition = "background 1s ease-in-out";
    video.style.background = "white"; // Flash effect
    setTimeout(() => {
        video.style.background = "black"; // Reset to black
    }, 100);
}

// Take Photo and Store It
function takePhoto() {
    if (photoCount < 3) {
        flashEffect(); // Trigger flash

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL("image/png");

        takenPhotos.push(imageData);
        localStorage.setItem("takenPhotos", JSON.stringify(takenPhotos));

        dots[photoCount].style.backgroundColor = "#38FD42";
        photoCount++;

        if (photoCount < 3) {
            setTimeout(startCountdown, 1000);
        } else {
            setTimeout(() => {
                // ✅ Stop Camera After Last Photo
                video.srcObject.getTracks().forEach(track => track.stop());
                cameraPage.classList.add("hidden");
                customizationPage.classList.remove("hidden");
            }, 1000);
        }
    }
}
