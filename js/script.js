document.addEventListener('DOMContentLoaded', () => {
    const navBar = document.querySelector('.liquid-glass-element');
    const navButtons = document.querySelectorAll('.nav-button');
    const movingBubble = document.getElementById('movingBubble');
    const logoLink = document.getElementById('logoLink');
    const learnMoreBtn = document.getElementById('learnMoreBtn'); // Added learnMoreBtn
    const serviceCardsContainer = document.getElementById('serviceCardsContainer'); // Added serviceCardsContainer
    const scrollLeftBtn = document.getElementById('scrollLeftBtn'); // Added scrollLeftBtn
    const scrollRightBtn = document.getElementById('scrollRightBtn'); // Added scrollRightBtn
    let serviceCardItems = Array.from(document.querySelectorAll('.service-card-item')); // Added serviceCardItems
    
    let selectedTab = document.querySelector('.nav-button.selected');

    // Define your sections and their corresponding nav data-tab-name
    const sections = [
        { element: document.getElementById('home-section'), navTab: 'home' },
        { element: document.getElementById('services-section'), navTab: 'services' },
        { element: document.getElementById('works-section'), navTab: 'works' }, 
        { element: document.getElementById('about-us-section'), navTab: 'about' },
        { element: document.getElementById('contact-section'), navTab: 'contact' }, 
    ];

    function updateBubblePosition(targetButton) {
        if (!targetButton) return;
        const navBarRect = navBar.getBoundingClientRect();
        const buttonRect = targetButton.getBoundingClientRect();
        const leftPosition = (buttonRect.left - navBarRect.left); 
        const buttonWidth = buttonRect.width;
        movingBubble.style.left = `${leftPosition}px`;
        movingBubble.style.width = `${buttonWidth}px`;
    }

    /**
     * Scrolls to the target section or to the top of the page.
     * @param {string} sectionName The data-tab-name of the target section (e.g., 'home', 'services', 'about').
     */
    function scrollToSection(sectionName) {
        let targetElement;
        const offset = 120; // 120px gap from the top

        if (sectionName === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        } else {
            targetElement = document.getElementById(sectionName + '-section');
        }

        if (targetElement) {
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateBubblePosition(selectedTab);

    navButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            updateBubblePosition(button);
        });
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (selectedTab) {
                selectedTab.classList.remove('selected');
            }
            selectedTab = event.currentTarget;
            selectedTab.classList.add('selected');
            updateBubblePosition(selectedTab);
            const targetTabName = selectedTab.dataset.tabName;
            scrollToSection(targetTabName);
        });
    });

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
        scrollToSection('home');
    });

    navBar.addEventListener('mouseleave', () => {
        updateBubblePosition(selectedTab);
    });

    learnMoreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const aboutNavButton = document.querySelector('.nav-button[data-tab-name="about"]');
        if (aboutNavButton) {
            if (selectedTab) {
                selectedTab.classList.remove('selected');
            }
            selectedTab = aboutNavButton;
            selectedTab.classList.add('selected');
            updateBubblePosition(selectedTab);
        }
        scrollToSection('about');
    });

    // --- Infinite Carousel Logic ---
    const CARD_COUNT = serviceCardItems.length;
    const CLONE_COUNT = CARD_COUNT; 
    let isScrolling;

    function setupInfiniteScroll() {
        const currentClones = serviceCardsContainer.querySelectorAll('.service-card-item.cloned');
        currentClones.forEach(clone => clone.remove());
        serviceCardItems = Array.from(document.querySelectorAll('.service-card-item:not(.cloned)'));
        
        for (let i = 0; i < CLONE_COUNT; i++) {
            const clone = serviceCardItems[CARD_COUNT - 1 - i].cloneNode(true);
            clone.classList.add('cloned');
            serviceCardsContainer.prepend(clone);
        }

        for (let i = 0; i < CLONE_COUNT; i++) {
            const clone = serviceCardItems[i].cloneNode(true);
            clone.classList.add('cloned');
            serviceCardsContainer.appendChild(clone);
        }

        serviceCardItems = Array.from(document.querySelectorAll('.service-card-item'));

        const initialScrollPosition = serviceCardItems[CLONE_COUNT].offsetLeft;
        serviceCardsContainer.scrollLeft = initialScrollPosition;
    }

    function handleInfiniteScroll() {
        const scrollLeft = serviceCardsContainer.scrollLeft;
        const cardWidthWithGap = serviceCardItems[CLONE_COUNT].offsetWidth + 20;

        if (scrollLeft >= serviceCardItems[CLONE_COUNT * 2].offsetLeft) {
            serviceCardsContainer.scrollLeft = serviceCardItems[CLONE_COUNT].offsetLeft;
        } 
        else if (scrollLeft <= 0) {
            const lastOriginalCardIndex = CLONE_COUNT * 2 -1; 
            const targetScrollLeft = serviceCardItems[lastOriginalCardIndex].offsetLeft - (serviceCardsContainer.offsetWidth - serviceCardItems[lastOriginalCardIndex].offsetWidth - 20) ; 
            serviceCardsContainer.scrollLeft = targetScrollLeft;
        }
    }

    // Scroll with arrows
    scrollLeftBtn.addEventListener('click', () => {
        const cardWidth = serviceCardItems[CLONE_COUNT].offsetWidth;
        const gap = 20;
        serviceCardsContainer.scrollBy({
            left: -(cardWidth + gap),
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', () => {
        const cardWidth = serviceCardItems[CLONE_COUNT].offsetWidth;
        const gap = 20;
        serviceCardsContainer.scrollBy({
            left: (cardWidth + gap),
            behavior: 'smooth'
        });
    });

    serviceCardsContainer.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            handleInfiniteScroll();
        }, 66);
    });

    setupInfiniteScroll();
    window.addEventListener('resize', () => {
        updateBubblePosition(selectedTab);
        setupInfiniteScroll();
    });

    // --- Intersection Observer for Nav Bubble on Scroll ---
    const sectionObserverOptions = {
        root: null, // relative to the viewport
        rootMargin: '-100px 0px -100px 0px', // A "hot zone" in the middle of the viewport, adjusted for header
        threshold: 0.6 // Changed to 0.6 to activate when 60% of the section is visible
    };

    const sectionObserverCallback = (entries) => {
        let currentActiveSectionId = null;
        let maxRatio = 0;

        entries.forEach(entry => {
            // Find the section that is most visible (highest intersectionRatio) or closest to the top
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                maxRatio = entry.intersectionRatio;
                currentActiveSectionId = entry.target.id;
            }
        });

        if (currentActiveSectionId) {
            const activeNavTabName = currentActiveSectionId.replace('-section', '');
            const correspondingNavButton = document.querySelector(`.nav-button[data-tab-name="${activeNavTabName}"]`);
            
            if (correspondingNavButton && correspondingNavButton !== selectedTab) {
                if (selectedTab) {
                    selectedTab.classList.remove('selected');
                }
                selectedTab = correspondingNavButton;
                selectedTab.classList.add('selected');
                updateBubblePosition(selectedTab);
            }
        }
    };

    const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);

    // Observe each relevant content section
    sections.forEach(section => {
        if (section.element) {
            sectionObserver.observe(section.element);
        }
    });
});
