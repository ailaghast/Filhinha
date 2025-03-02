/**
 * ImageLoader Implementation Example
 * This file demonstrates how to use the ImageLoader utility with the existing website.
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the random image element
    const randomImageElement = document.getElementById('randomImage');
    const catEffectBtn = document.getElementById('catEffectBtn');
    
    // Initially disable the button until images are loaded
    if (catEffectBtn) {
        catEffectBtn.disabled = true;
        catEffectBtn.style.opacity = "0.5";
        catEffectBtn.style.cursor = "not-allowed";
    }
    
    // Initialize the image loader with the existing images array
    const imageLoader = new ImageLoader({
        images: images, // Using the existing 'images' array from index.html
        showUI: true,
        uiOptions: {
            position: 'top',
            barColor: '#f06292', // Pink color for the cat theme
            showPercentage: true
        },
        onProgress: function(percentage) {
            console.log(`Loading progress: ${percentage}%`);
            
            // You could update other UI elements here if needed
            // For example, adding a loading message to the page
            if (percentage < 100) {
                updateLoadingStatus(`Loading cat photos... ${percentage}%`);
            }
        },
        onComplete: function(imageCache) {
            console.log('All images loaded successfully!');
            
            // Enable the button now that images are loaded
            if (catEffectBtn) {
                catEffectBtn.disabled = false;
                catEffectBtn.style.opacity = "1";
                catEffectBtn.style.cursor = "pointer";
            }
            
            // Set initial random image
            setRandomImage(imageLoader);
            
            // Clear any loading status message
            updateLoadingStatus('');
        },
        onError: function(src, index) {
            console.error(`Failed to load image: ${src}`);
        }
    });
    
    // Start preloading all images
    imageLoader.preloadAll();
    
    // Function to set a random image
    function setRandomImage(loader) {
        if (randomImageElement) {
            const randomSrc = loader.getRandomImageURL();
            if (randomSrc) {
                randomImageElement.src = randomSrc;
            }
        }
    }
    
    // Function to update loading status text
    function updateLoadingStatus(message) {
        let statusElement = document.getElementById('loading-status');
        
        if (!statusElement && message) {
            // Create status element if it doesn't exist
            statusElement = document.createElement('div');
            statusElement.id = 'loading-status';
            Object.assign(statusElement.style, {
                position: 'fixed',
                bottom: '30px',
                left: '0',
                width: '100%',
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                zIndex: '1000'
            });
            document.body.appendChild(statusElement);
        }
        
        if (statusElement) {
            if (message) {
                statusElement.textContent = message;
                statusElement.style.display = 'block';
            } else {
                statusElement.style.display = 'none';
            }
        }
    }
    
    // Override the getRandomImage function from the original script
    window.getRandomImage = function() {
        return imageLoader.getRandomImageURL() || images[Math.floor(Math.random() * images.length)];
    };
    
    // You could also modify the cat effect button click handler to use the loader
    if (catEffectBtn) {
        // Store the original event handler
        const originalClickHandler = catEffectBtn.onclick;
        
        // Replace with new handler that uses the image loader
        catEffectBtn.onclick = function(event) {
            // Make sure all images are loaded before allowing effects
            if (imageLoader.getLoadingProgress() === 100) {
                // Call the original handler if it exists
                if (originalClickHandler) {
                    originalClickHandler.call(this, event);
                }
                
                // Use the loader to set a new random image
                setTimeout(() => {
                    setRandomImage(imageLoader);
                }, 100);
            }
        };
    }
});