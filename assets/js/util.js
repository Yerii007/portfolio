/*
	Modern Portfolio Utility Functions
	Jeremy Yerimah - Backend Developer
	Enhanced with modern JavaScript patterns and improved functionality
*/

(function($) {
	'use strict';

	// ========================================
	// NAVIGATION LIST GENERATOR
	// ========================================
	
	/**
	 * Generate an indented list of links from a nav element
	 * Useful for creating mobile menus or sidebar navigation
	 * @return {String} HTML string of navigation links
	 */
	$.fn.navList = function() {
		const $this = $(this);
		const $links = $this.find('a');
		const navItems = [];

		$links.each(function() {
			const $link = $(this);
			const indent = Math.max(0, $link.parents('li').length - 1);
			const href = $link.attr('href') || '#';
			const target = $link.attr('target') || '';
			const text = $link.text();

			// Build navigation item HTML
			const navItem = 
				'<a ' +
					'class="link depth-' + indent + '" ' +
					(target ? 'target="' + target + '" ' : '') +
					'href="' + href + '"' +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					text +
				'</a>';

			navItems.push(navItem);
		});

		return navItems.join('');
	};

	// ========================================
	// PANEL FUNCTIONALITY
	// ========================================
	
	/**
	 * Convert an element into a slide-out panel
	 * Enhanced with modern touch events and better performance
	 * @param {Object} userConfig Configuration options
	 * @return {jQuery} jQuery object for chaining
	 */
	$.fn.panel = function(userConfig) {
		
		// Return if no elements
		if (this.length === 0) {
			return this;
		}

		// Handle multiple elements
		if (this.length > 1) {
			this.each(function() {
				$(this).panel(userConfig);
			});
			return this;
		}

		// Cache references
		const $this = $(this);
		const $body = $('body');
		const $window = $(window);
		const id = $this.attr('id');

		// Default configuration
		const config = $.extend({
			delay: 0,
			hideOnClick: false,
			hideOnEscape: false,
			hideOnSwipe: false,
			resetScroll: false,
			resetForms: false,
			side: null,
			target: $this,
			visibleClass: 'visible'
		}, userConfig);

		// Ensure target is jQuery object
		if (typeof config.target !== 'object' || !config.target.jquery) {
			config.target = $(config.target);
		}

		// ========================================
		// PANEL METHODS
		// ========================================
		
		/**
		 * Hide the panel
		 * @param {Event} event Optional event object
		 */
		$this._hide = function(event) {
			// Already hidden
			if (!config.target.hasClass(config.visibleClass)) {
				return;
			}

			// Prevent default if event provided
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			// Remove visible class
			config.target.removeClass(config.visibleClass);

			// Post-hide actions
			setTimeout(function() {
				// Reset scroll position
				if (config.resetScroll) {
					$this.scrollTop(0);
				}

				// Reset forms
				if (config.resetForms) {
					$this.find('form').each(function() {
						this.reset();
					});
				}
			}, config.delay);
		};

		/**
		 * Show the panel
		 */
		$this._show = function() {
			if (!config.target.hasClass(config.visibleClass)) {
				config.target.addClass(config.visibleClass);
			}
		};

		/**
		 * Toggle the panel
		 */
		$this._toggle = function() {
			if (config.target.hasClass(config.visibleClass)) {
				$this._hide();
			} else {
				$this._show();
			}
		};

		// ========================================
		// VENDOR FIXES
		// ========================================
		
		$this
			.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
			.css('-webkit-overflow-scrolling', 'touch');

		// ========================================
		// HIDE ON CLICK
		// ========================================
		
		if (config.hideOnClick) {
			$this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

			$this.on('click', 'a', function(event) {
				const $link = $(this);
				const href = $link.attr('href');
				const target = $link.attr('target');

				// Don't process internal or empty links
				if (!href || href === '#' || href === '' || href === '#' + id) {
					return;
				}

				// Prevent default
				event.preventDefault();
				event.stopPropagation();

				// Hide panel
				$this._hide();

				// Navigate after delay
				setTimeout(function() {
					if (target === '_blank') {
						window.open(href);
					} else {
						window.location.href = href;
					}
				}, config.delay + 10);
			});
		}

		// ========================================
		// TOUCH EVENTS
		// ========================================
		
		let touchStartX = null;
		let touchStartY = null;

		$this.on('touchstart', function(event) {
			touchStartX = event.originalEvent.touches[0].pageX;
			touchStartY = event.originalEvent.touches[0].pageY;
		});

		$this.on('touchmove', function(event) {
			if (touchStartX === null || touchStartY === null) {
				return;
			}

			const touchX = event.originalEvent.touches[0].pageX;
			const touchY = event.originalEvent.touches[0].pageY;
			const diffX = touchStartX - touchX;
			const diffY = touchStartY - touchY;
			const height = $this.outerHeight();
			const scrollPos = $this.scrollTop();
			const scrollHeight = $this.get(0).scrollHeight;

			// Hide on swipe
			if (config.hideOnSwipe) {
				let shouldHide = false;
				const boundary = 20;
				const delta = 50;

				switch (config.side) {
					case 'left':
						shouldHide = (Math.abs(diffY) < boundary) && (diffX > delta);
						break;
					case 'right':
						shouldHide = (Math.abs(diffY) < boundary) && (diffX < -delta);
						break;
					case 'top':
						shouldHide = (Math.abs(diffX) < boundary) && (diffY > delta);
						break;
					case 'bottom':
						shouldHide = (Math.abs(diffX) < boundary) && (diffY < -delta);
						break;
				}

				if (shouldHide) {
					touchStartX = null;
					touchStartY = null;
					$this._hide();
					return false;
				}
			}

			// Prevent vertical scrolling past boundaries
			if ((scrollPos <= 0 && diffY < 0) || 
				(scrollPos >= scrollHeight - height - 2 && diffY > 0)) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		$this.on('touchend', function() {
			touchStartX = null;
			touchStartY = null;
		});

		// ========================================
		// PREVENT BUBBLING
		// ========================================
		
		$this.on('click touchend touchstart touchmove', function(event) {
			event.stopPropagation();
		});

		// Hide panel on self-referencing link click
		$this.on('click', 'a[href="#' + id + '"]', function(event) {
			event.preventDefault();
			event.stopPropagation();
			config.target.removeClass(config.visibleClass);
		});

		// ========================================
		// BODY EVENTS
		// ========================================
		
		// Hide panel on body click
		$body.on('click touchend', function(event) {
			$this._hide(event);
		});

		// Toggle panel on trigger click
		$body.on('click', 'a[href="#' + id + '"]', function(event) {
			event.preventDefault();
			event.stopPropagation();
			$this._toggle();
		});

		// ========================================
		// KEYBOARD EVENTS
		// ========================================
		
		// Hide on ESC key
		if (config.hideOnEscape) {
			$window.on('keydown', function(event) {
				if (event.keyCode === 27 || event.key === 'Escape') {
					$this._hide(event);
				}
			});
		}

		return $this;
	};

	// ========================================
	// PLACEHOLDER POLYFILL
	// ========================================
	
	/**
	 * Apply placeholder polyfill for older browsers
	 * Modern browsers support this natively
	 * @return {jQuery} jQuery object for chaining
	 */
	$.fn.placeholder = function() {
		
		// Browser supports placeholders natively
		if ('placeholder' in document.createElement('input')) {
			return this;
		}

		// Return if no elements
		if (this.length === 0) {
			return this;
		}

		// Handle multiple elements
		if (this.length > 1) {
			this.each(function() {
				$(this).placeholder();
			});
			return this;
		}

		const $this = $(this);

		// Text and textarea inputs
		$this.find('input[type=text], textarea')
			.each(function() {
				const $input = $(this);
				const placeholder = $input.attr('placeholder');

				if ($input.val() === '' || $input.val() === placeholder) {
					$input
						.addClass('polyfill-placeholder')
						.val(placeholder);
				}
			})
			.on('blur', function() {
				const $input = $(this);
				if ($input.attr('name').match(/-polyfill-field$/)) {
					return;
				}
				if ($input.val() === '') {
					$input
						.addClass('polyfill-placeholder')
						.val($input.attr('placeholder'));
				}
			})
			.on('focus', function() {
				const $input = $(this);
				if ($input.attr('name').match(/-polyfill-field$/)) {
					return;
				}
				if ($input.val() === $input.attr('placeholder')) {
					$input
						.removeClass('polyfill-placeholder')
						.val('');
				}
			});

		// Password inputs (requires special handling)
		$this.find('input[type=password]').each(function() {
			const $input = $(this);
			const $textField = $input.clone().attr('type', 'text');

			if ($input.attr('id')) {
				$textField.attr('id', $input.attr('id') + '-polyfill-field');
			}
			if ($input.attr('name')) {
				$textField.attr('name', $input.attr('name') + '-polyfill-field');
			}

			$textField
				.addClass('polyfill-placeholder')
				.val($textField.attr('placeholder'))
				.insertAfter($input);

			if ($input.val() === '') {
				$input.hide();
			} else {
				$textField.hide();
			}

			$input.on('blur', function() {
				const $text = $input.parent().find('input[name=' + $input.attr('name') + '-polyfill-field]');
				if ($input.val() === '') {
					$input.hide();
					$text.show();
				}
			});

			$textField
				.on('focus', function() {
					const $password = $textField.parent().find('input[name=' + $textField.attr('name').replace('-polyfill-field', '') + ']');
					$textField.hide();
					$password.show().focus();
				})
				.on('keypress', function(event) {
					event.preventDefault();
					$textField.val('');
				});
		});

		// Form submit handler
		$this.on('submit', function() {
			$this.find('input[type=text], input[type=password], textarea').each(function() {
				const $input = $(this);
				if ($input.attr('name').match(/-polyfill-field$/)) {
					$input.attr('name', '');
				}
				if ($input.val() === $input.attr('placeholder')) {
					$input.removeClass('polyfill-placeholder').val('');
				}
			});
		});

		// Form reset handler
		$this.on('reset', function() {
			setTimeout(function() {
				$this.find('input[type=text], input[type=password], textarea').each(function() {
					const $input = $(this);
					$input.removeClass('polyfill-placeholder');

					if ($input.is(':password')) {
						const $text = $input.parent().find('input[name=' + $input.attr('name') + '-polyfill-field]');
						if ($input.val() === '') {
							$input.hide();
							$text.show();
						} else {
							$input.show();
							$text.hide();
						}
					} else if ($input.val() === '') {
						$input.addClass('polyfill-placeholder').val($input.attr('placeholder'));
					}
				});
			}, 0);
		});

		return $this;
	};

	// ========================================
	// ELEMENT PRIORITIZATION
	// ========================================
	
	/**
	 * Move elements to/from first position in parent
	 * Useful for responsive reordering
	 * @param {jQuery|String} $elements Elements to prioritize
	 * @param {Boolean} condition If true, move to top; if false, restore position
	 */
	$.prioritize = function($elements, condition) {
		const key = '__prioritize';

		// Convert to jQuery if needed
		if (typeof $elements !== 'object' || !$elements.jquery) {
			$elements = $($elements);
		}

		// Process each element
		$elements.each(function() {
			const $element = $(this);
			const $parent = $element.parent();

			// No parent found
			if ($parent.length === 0) {
				return;
			}

			// Not moved yet
			if (!$element.data(key)) {
				// Don't move if condition is false
				if (!condition) {
					return;
				}

				// Get previous sibling (reference point)
				const $previous = $element.prev();

				// Already at top
				if ($previous.length === 0) {
					return;
				}

				// Move to top
				$element.prependTo($parent);

				// Store reference
				$element.data(key, $previous);
			} 
			// Already moved
			else {
				// Don't restore if condition is true
				if (condition) {
					return;
				}

				const $previous = $element.data(key);

				// Restore position
				$element.insertAfter($previous);

				// Remove reference
				$element.removeData(key);
			}
		});
	};

	// ========================================
	// DEBOUNCE UTILITY
	// ========================================
	
	/**
	 * Debounce function execution
	 * @param {Function} func Function to debounce
	 * @param {Number} wait Wait time in milliseconds
	 * @param {Boolean} immediate Execute immediately on first call
	 * @return {Function} Debounced function
	 */
	$.debounce = function(func, wait, immediate) {
		let timeout;
		return function() {
			const context = this;
			const args = arguments;
			const later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(context, args);
			}
		};
	};

	// ========================================
	// THROTTLE UTILITY
	// ========================================
	
	/**
	 * Throttle function execution
	 * @param {Function} func Function to throttle
	 * @param {Number} limit Time limit in milliseconds
	 * @return {Function} Throttled function
	 */
	$.throttle = function(func, limit) {
		let inThrottle;
		return function() {
			const context = this;
			const args = arguments;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(function() {
					inThrottle = false;
				}, limit);
			}
		};
	};

})(jQuery);