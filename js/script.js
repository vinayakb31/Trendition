document.addEventListener('DOMContentLoaded', () => {
    const navBar = document.querySelector('.liquid-glass-element');
    const navButtons = document.querySelectorAll('.nav-button');
    const movingBubble = document.getElementById('movingBubble');
    const logoLink = document.getElementById('logoLink');
    let selectedTab = document.querySelector('.nav-button.selected');
    const scrollThreshold = 200; // Pixels from top to trigger text color change

    /**
     * Updates the position and width of the moving bubble.
     * @param {HTMLElement} targetButton The button to position the bubble under.
     */
    function updateBubblePosition(targetButton) {
        if (!targetButton) return;

        const navBarRect = navBar.getBoundingClientRect();
        const buttonRect = targetButton.getBoundingClientRect();

        // Calculate position relative to the parent .liquid-glass-element
        const leftPosition = buttonRect.left - navBarRect.left;
        const buttonWidth = buttonRect.width;

        movingBubble.style.left = `${leftPosition}px`;
        movingBubble.style.width = `${buttonWidth}px`;
    }

    /**
     * Adjusts text color based on scroll position.
     */
    function handleScrollTextColor() {
        if (window.scrollY > scrollThreshold) {
            document.body.classList.add('light-text-mode');
        } else {
            document.body.classList.remove('light-text-mode');
        }
    }

    // Initialize bubble position and text color on load
    updateBubblePosition(selectedTab);
    handleScrollTextColor(); // Set initial text color

    // Add event listeners for mouseover on each button
    navButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            updateBubblePosition(button);
        });

        // Handle click to change selected tab
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (selectedTab) {
                selectedTab.classList.remove('selected');
            }
            selectedTab = event.currentTarget;
            selectedTab.classList.add('selected');
            updateBubblePosition(selectedTab);
        });
    });

    // Add click event listener to the logo
    logoLink.addEventListener('click', (event) => {
        event.preventDefault();
        
        const homeButton = document.querySelector('.nav-button[data-tab-name="home"]');
        
        if (homeButton) {
            if (selectedTab) {
                selectedTab.classList.remove('selected');
            }
            selectedTab = homeButton;
            selectedTab.classList.add('selected');
            updateBubblePosition(selectedTab);
        }
        // Optional: Scroll to top of the page when logo is clicked
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Add event listener for mouseleave on the navigation bar
    navBar.addEventListener('mouseleave', () => {
        updateBubblePosition(selectedTab);
    });

    // Recalculate bubble position on window resize for responsiveness
    window.addEventListener('resize', () => {
        updateBubblePosition(selectedTab);
    });

    // Add scroll event listener for dynamic text color
    window.addEventListener('scroll', handleScrollTextColor);
});
