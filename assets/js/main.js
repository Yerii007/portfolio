/*
	Modern Portfolio JavaScript
	Jeremy Yerimah - Backend Developer
	Enhanced with modern ES6+ patterns and improved performance
*/

(function($) {
	'use strict';

	// Cache DOM elements
	const $window = $(window);
	const $body = $('body');
	const $sidebar = $('#sidebar');
	const $wrapper = $('#wrapper');

	// ========================================
	// RESPONSIVE BREAKPOINTS
	// ========================================
	breakpoints({
		xlarge:   ['1281px',  '1680px'],
		large:    ['981px',   '1280px'],
		medium:   ['737px',   '980px'],
		small:    ['481px',   '736px'],
		xsmall:   [null,      '480px']
	});

	// ========================================
	// BROWSER DETECTION & IE FIXES
	// ========================================
	if (browser.name === 'ie') {
		$body.addClass('is-ie');
	}

	// ========================================
	// PAGE LOAD ANIMATIONS
	// ========================================
	$window.on('load', function() {
		// Delay to ensure smooth initial animation
		setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// ========================================
	// SMOOTH SCROLL BEHAVIOR
	// ========================================
	
	// Enhanced smooth scrolling for internal links
	$('a[href^="#"]').on('click', function(e) {
		const href = $(this).attr('href');
		
		// Don't process empty or single # links
		if (href === '#' || href === '') {
			return;
		}

		const $target = $(href);
		
		if ($target.length) {
			e.preventDefault();
			
			// Calculate offset for fixed headers
			let offset = 0;
			if (breakpoints.active('<=large') && !breakpoints.active('<=small') && $sidebar.length > 0) {
				offset = $sidebar.height();
			}

			// Smooth scroll animation
			$('html, body').animate({
				scrollTop: $target.offset().top - offset
			}, 800, 'swing');
		}
	});

	// ========================================
	// FORM HANDLING
	// ========================================
	
	// Enhanced form submission
	$('form').on('submit', function(e) {
		const $form = $(this);
		const $submitBtn = $form.find('.submit, [type="submit"]');
		
		// Basic validation
		let isValid = true;
		$form.find('[required]').each(function() {
			if (!$(this).val()) {
				isValid = false;
				$(this).addClass('error');
			} else {
				$(this).removeClass('error');
			}
		});

		if (!isValid) {
			e.preventDefault();
			return false;
		}

		// Disable submit button to prevent double submission
		$submitBtn.prop('disabled', true).text('Sending...');
	});

	// Remove error class on input
	$('input, textarea').on('input', function() {
		$(this).removeClass('error');
	});

	// Non-input submit buttons
	$('form').on('click', '.submit', function(event) {
		event.stopPropagation();
		event.preventDefault();
		$(this).parents('form').submit();
	});

	// ========================================
	// SIDEBAR NAVIGATION
	// ========================================
	
	if ($sidebar.length > 0) {
		const $sidebar_links = $sidebar.find('a');

		$sidebar_links
			.addClass('scrolly')
			.on('click', function(e) {
				const $this = $(this);
				const href = $this.attr('href');

				// External link handling
				if (!href || href.charAt(0) !== '#') {
					return;
				}

				e.preventDefault();

				// Deactivate all links
				$sidebar_links.removeClass('active active-locked');

				// Activate clicked link and lock it
				$this.addClass('active active-locked');

				// Auto-remove lock after scroll completes
				setTimeout(function() {
					$this.removeClass('active-locked');
				}, 1500);
			})
			.each(function() {
				const $this = $(this);
				const id = $this.attr('href');
				const $section = $(id);

				// No section found for this link
				if ($section.length < 1) {
					return;
				}

				// Scrollex implementation for section activation
				$section.scrollex({
					mode: 'middle',
					top: '-20vh',
					bottom: '-20vh',
					initialize: function() {
						// Deactivate section initially
						$section.addClass('inactive');
					},
					enter: function() {
						// Activate section
						$section.removeClass('inactive');

						// Update active link if no locked links
						if ($sidebar_links.filter('.active-locked').length === 0) {
							$sidebar_links.removeClass('active');
							$this.addClass('active');
						} else if ($this.hasClass('active-locked')) {
							$this.removeClass('active-locked');
						}
					}
				});
			});
	}

	// ========================================
	// SCROLL-BASED ANIMATIONS
	// ========================================
	
	// Scrolly links (smooth scrolling)
	$('.scrolly').scrolly({
		speed: 1000,
		offset: function() {
			// Adjust offset for sidebar on certain screen sizes
			if (breakpoints.active('<=large') && 
				!breakpoints.active('<=small') && 
				$sidebar.length > 0) {
				return $sidebar.height();
			}
			return 0;
		}
	});

	// ========================================
	// SPOTLIGHT SECTIONS
	// ========================================
	
	$('.spotlights > section, .spotlights > article').each(function() {
		const $this = $(this);
		const $image = $this.find('.image');
		const $img = $image.find('img');

		// Set background image from img src
		if ($img.length) {
			const imgSrc = $img.attr('src');
			$image.css('background-image', 'url(' + imgSrc + ')');

			// Set background position if data attribute exists
			const position = $img.data('position');
			if (position) {
				$image.css('background-position', position);
			}

			// Hide original img tag
			$img.hide();
		}

		// Scrollex for entrance animation
		$this.scrollex({
			mode: 'middle',
			top: '-10vh',
			bottom: '-10vh',
			initialize: function() {
				$this.addClass('inactive');
			},
			enter: function() {
				$this.removeClass('inactive');
			}
		});
	});

	// ========================================
	// FEATURES SECTIONS
	// ========================================
	
	$('.features').scrollex({
		mode: 'middle',
		top: '-20vh',
		bottom: '-20vh',
		initialize: function() {
			$(this).addClass('inactive');
		},
		enter: function() {
			$(this).removeClass('inactive');
		}
	});

	// ========================================
	// WRAPPER FADE ANIMATIONS
	// ========================================
	
	$('.wrapper.fade-up, .wrapper.fade-down, .wrapper.fade').each(function() {
		const $this = $(this);
		
		$this.scrollex({
			mode: 'middle',
			top: '-20vh',
			bottom: '-20vh',
			initialize: function() {
				$this.addClass('inactive');
			},
			enter: function() {
				$this.removeClass('inactive');
			}
		});
	});

	// ========================================
	// PERFORMANCE OPTIMIZATIONS
	// ========================================
	
	// Debounce scroll events
	let scrollTimeout;
	$window.on('scroll', function() {
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = setTimeout(function() {
			// Add any scroll-based functionality here
		}, 150);
	});

	// Lazy load images (if needed)
	if ('IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver(function(entries, observer) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					const img = entry.target;
					const src = img.getAttribute('data-src');
					if (src) {
						img.setAttribute('src', src);
						img.removeAttribute('data-src');
						observer.unobserve(img);
					}
				}
			});
		});

		document.querySelectorAll('img[data-src]').forEach(function(img) {
			imageObserver.observe(img);
		});
	}

	// ========================================
	// ACCESSIBILITY ENHANCEMENTS
	// ========================================
	
	// Keyboard navigation for sidebar
	$sidebar.find('a').on('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$(this).click();
		}
	});

	// Focus management for modals/dialogs
	$(document).on('keydown', function(e) {
		if (e.key === 'Escape') {
			// Close any open modals or overlays
			$('.modal, .overlay').removeClass('active');
		}
	});

	// ========================================
	// EXTERNAL LINK HANDLING
	// ========================================
	
	// Add target="_blank" and security attributes to external links
	$('a[href^="http"]').not('[href*="' + window.location.hostname + '"]').each(function() {
		$(this).attr({
			target: '_blank',
			rel: 'noopener noreferrer'
		});
	});

	// ========================================
	// DYNAMIC YEAR IN FOOTER
	// ========================================
	
	const currentYear = new Date().getFullYear();
	$('footer').find('.year, [data-year]').text(currentYear);

	// ========================================
	// PRINT STYLES TRIGGER
	// ========================================
	
	$window.on('beforeprint', function() {
		$body.addClass('printing');
	});

	$window.on('afterprint', function() {
		$body.removeClass('printing');
	});

	// ========================================
	// CONTACT FORM ENHANCEMENTS
	// ========================================
	
	// Email validation
	function isValidEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	$('input[type="email"]').on('blur', function() {
		const $input = $(this);
		const email = $input.val();
		
		if (email && !isValidEmail(email)) {
			$input.addClass('error');
			// Could add error message here
		} else {
			$input.removeClass('error');
		}
	});

	// ========================================
	// PROGRESS INDICATOR
	// ========================================
	
	// Create reading progress bar for long pages
	if ($('#main').length && $('#main').height() > $window.height() * 2) {
		const $progressBar = $('<div class="reading-progress"></div>');
		$body.prepend($progressBar);

		$window.on('scroll', function() {
			const scrollTop = $window.scrollTop();
			const docHeight = $(document).height();
			const winHeight = $window.height();
			const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
			
			$progressBar.css('width', scrollPercent + '%');
		});
	}

	// ========================================
	// MOBILE MENU ENHANCEMENTS
	// ========================================
	
	// Close mobile menu on link click
	if (breakpoints.active('<=small')) {
		$sidebar.find('a').on('click', function() {
			$sidebar.removeClass('visible');
		});
	}

	// ========================================
	// ANALYTICS TRACKING (Optional)
	// ========================================
	
	// Track button clicks
	$('.button, .cta').on('click', function() {
		const buttonText = $(this).text().trim();
		const buttonHref = $(this).attr('href');
		
		// Send to analytics if available
		if (typeof gtag !== 'undefined') {
			gtag('event', 'button_click', {
				'event_category': 'engagement',
				'event_label': buttonText,
				'value': buttonHref
			});
		}
	});

	// Track external link clicks
	$('a[target="_blank"]').on('click', function() {
		const href = $(this).attr('href');
		
		if (typeof gtag !== 'undefined') {
			gtag('event', 'external_link', {
				'event_category': 'outbound',
				'event_label': href
			});
		}
	});

	// ========================================
	// CONSOLE EASTER EGG
	// ========================================
	
	console.log('%c👋 Hello, Developer!', 'font-size: 20px; font-weight: bold; color: #8b5cf6;');
	console.log('%cLooking for something? Check out my GitHub: https://github.com/Yerii007', 'font-size: 14px; color: #a78bfa;');
	console.log('%cInterested in working together? Contact me at yerimahjeremy@gmail.com', 'font-size: 14px; color: #ec4899;');

	// ========================================
	// INITIALIZATION COMPLETE
	// ========================================
	
	console.log('✓ Portfolio initialized successfully');

})(jQuery);