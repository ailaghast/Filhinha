/**
 * ImageLoader - A comprehensive utility for preloading and managing images
 * Features:
 * - Preload multiple images in background
 * - Track loading progress
 * - Show visual loading indicator
 * - Handle loading errors gracefully
 */
class ImageLoader {
    /**
     * Create a new ImageLoader instance
     * @param {Object} options - Configuration options
     * @param {Array} options.images - Array of image URLs to preload
     * @param {Function} options.onProgress - Callback for loading progress (receives percentage)
     * @param {Function} options.onComplete - Callback when all images are loaded
     * @param {Function} options.onError - Callback when an image fails to load
     * @param {Boolean} options.showUI - Whether to show the loading UI
     * @param {Object} options.uiOptions - Options for the UI component
     */
    constructor(options = {}) {
        this.images = options.images || [];
        this.onProgress = options.onProgress || function() {};
        this.onComplete = options.onComplete || function() {};
        this.onError = options.onError || function() {};
        
        this.loadedImages = 0;
        this.totalImages = this.images.length;
        this.imageElements = [];
        this.imageCache = {};
        
        // Create UI if needed
        if (options.showUI !== false) {
            this.ui = new ImageLoaderUI(options.uiOptions || {});
            
            // Hook up UI to progress updates
            const originalOnProgress = this.onProgress;
            this.onProgress = (percentage) => {
                this.ui.updateProgress(percentage);
                originalOnProgress(percentage);
            };
            
            // Show UI
            this.ui.show();
        }
    }
    
    /**
     * Start preloading all images
     */
    preloadAll() {
        if (this.totalImages === 0) {
            this.onProgress(100);
            this.onComplete({});
            return;
        }
        
        this.images.forEach((src, index) => {
            this.preloadImage(src, index);
        });
    }
    
    /**
     * Preload a single image
     * @param {string} src - Image URL
     * @param {number} index - Index in the images array
     */
    preloadImage(src, index) {
        const img = new Image();
        
        img.onload = () => {
            this.handleImageLoad(img, src, index);
        };
        
        img.onerror = () => {
            this.handleImageError(src, index);
        };
        
        img.src = src;
        this.imageElements[index] = img;
    }
    
    /**
     * Handle successful image load
     * @param {HTMLImageElement} img - The loaded image element
     * @param {string} src - Image URL
     * @param {number} index - Index in the images array
     */
    handleImageLoad(img, src, index) {
        this.loadedImages++;
        this.imageCache[src] = img;
        
        const progress = Math.round((this.loadedImages / this.totalImages) * 100);
        this.onProgress(progress);
        
        if (this.loadedImages === this.totalImages) {
            this.onComplete(this.imageCache);
        }
    }
    
    /**
     * Handle image loading error
     * @param {string} src - Image URL
     * @param {number} index - Index in the images array
     */
    handleImageError(src, index) {
        this.loadedImages++;
        this.onError(src, index);
        
        const progress = Math.round((this.loadedImages / this.totalImages) * 100);
        this.onProgress(progress);
        
        if (this.loadedImages === this.totalImages) {
            this.onComplete(this.imageCache);
        }
    }
    
    /**
     * Get a random image from the preloaded cache
     * @returns {HTMLImageElement|null} A random image or null if none are loaded
     */
    getRandomImage() {
        const cachedUrls = Object.keys(this.imageCache);
        if (cachedUrls.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * cachedUrls.length);
        return this.imageCache[cachedUrls[randomIndex]];
    }
    
    /**
     * Get a random image URL from the preloaded cache
     * @returns {string|null} A random image URL or null if none are loaded
     */
    getRandomImageURL() {
        const cachedUrls = Object.keys(this.imageCache);
        if (cachedUrls.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * cachedUrls.length);
        return cachedUrls[randomIndex];
    }
    
    /**
     * Check if a specific image has been loaded
     * @param {string} src - Image URL
     * @returns {boolean} True if the image is loaded
     */
    isImageLoaded(src) {
        return !!this.imageCache[src];
    }
    
    /**
     * Get the percentage of images loaded
     * @returns {number} Percentage of images loaded (0-100)
     */
    getLoadingProgress() {
        if (this.totalImages === 0) return 100;
        return Math.round((this.loadedImages / this.totalImages) * 100);
    }
    
    /**
     * Add more images to the loader
     * @param {Array} images - Array of image URLs to add
     */
    addImages(images) {
        const startIndex = this.totalImages;
        this.images = this.images.concat(images);
        this.totalImages = this.images.length;
        
        images.forEach((src, i) => {
            this.preloadImage(src, startIndex + i);
        });
    }
}

/**
 * ImageLoaderUI - UI component for displaying image loading progress
 */
class ImageLoaderUI {
    /**
     * Create a new ImageLoaderUI instance
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of the container element
     * @param {string} options.position - Position of the loader ('top', 'bottom', 'middle')
     * @param {boolean} options.showPercentage - Whether to show percentage text
     * @param {string} options.barColor - Color of the progress bar
     * @param {number} options.height - Height of the progress bar in pixels
     */
    constructor(options = {}) {
        this.options = Object.assign({
            containerId: 'image-loader-container',
            position: 'top',
            showPercentage: true,
            barColor: '#4CAF50',
            height: 5,
            zIndex: 9999
        }, options);
        
        this.container = null;
        this.progressBar = null;
        this.percentageText = null;
        
        this.init();
    }
    
    /**
     * Initialize the UI components
     */
    init() {
        // Check if container already exists
        this.container = document.getElementById(this.options.containerId);
        
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.options.containerId;
            document.body.appendChild(this.container);
        }
        
        // Style the container
        this.styleContainer();
        
        // Create the progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'image-loader-progress';
        this.styleProgressBar();
        this.container.appendChild(this.progressBar);
        
        // Create percentage text if needed
        if (this.options.showPercentage) {
            this.percentageText = document.createElement('div');
            this.percentageText.className = 'image-loader-percentage';
            this.stylePercentageText();
            this.container.appendChild(this.percentageText);
        }
        
        // Initialize with 0%
        this.updateProgress(0);
    }
    
    /**
     * Apply styles to the container element
     */
    styleContainer() {
        Object.assign(this.container.style, {
            position: 'fixed',
            left: '0',
            width: '100%',
            zIndex: this.options.zIndex.toString(),
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            padding: '10px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.5s ease'
        });
        
        // Set position based on options
        switch (this.options.position) {
            case 'top':
                this.container.style.top = '0';
                break;
            case 'bottom':
                this.container.style.bottom = '0';
                break;
            case 'middle':
                this.container.style.top = '50%';
                this.container.style.transform = 'translateY(-50%)';
                break;
            default:
                this.container.style.top = '0';
        }
    }
    
    /**
     * Apply styles to the progress bar
     */
    styleProgressBar() {
        Object.assign(this.progressBar.style, {
            width: '0%',
            height: `${this.options.height}px`,
            backgroundColor: this.options.barColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
            maxWidth: '100%',
            alignSelf: 'flex-start'
        });
    }
    
    /**
     * Apply styles to the percentage text
     */
    stylePercentageText() {
        Object.assign(this.percentageText.style, {
            color: '#fff',
            textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
            fontSize: '14px',
            marginTop: '5px',
            fontFamily: 'Arial, sans-serif'
        });
    }
    
    /**
     * Update the progress display
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
        
        if (this.percentageText) {
            this.percentageText.textContent = `${percentage}%`;
        }
        
        // Show/hide based on progress
        if (percentage >= 100) {
            setTimeout(() => {
                this.container.style.opacity = '0';
                setTimeout(() => {
                    this.container.style.display = 'none';
                }, 500);
            }, 200);
        } else if (percentage > 0) {
            this.container.style.display = 'flex';
            this.container.style.opacity = '1';
        }
    }
    
    /**
     * Show the loading UI
     */
    show() {
        this.container.style.display = 'flex';
        setTimeout(() => {
            this.container.style.opacity = '1';
        }, 10);
    }
    
    /**
     * Hide the loading UI
     */
    hide() {
        this.container.style.opacity = '0';
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 500);
    }
}