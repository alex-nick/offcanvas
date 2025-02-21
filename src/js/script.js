( function ( window ) {
	'use strict';

	function extend( a, b ) {
		return Object.assign( a, b );
	}

	// returns the depth of the element "e" relative to element with id=id
	// for this calculation only parents with classname = waypoint are considered
	function getLevelDepth( e, id, waypoint ) {
		let depthCount = 0;
		while ( e ) {
			if ( e.id.indexOf( id ) >= 0 ) {
				return depthCount;
			}
			if ( e.classList.contains( waypoint ) ) {
				depthCount++;
			}
			e = e.parentNode;
		}
		return depthCount;
	}

	// returns the closest element to 'e' that has class "classname"
	function closest( e, classname ) {
		return e.closest( '.' + classname );
	}

	const MENU_ID = 'mp-menu';
	const CLASS_LEVEL = 'mp-level';
	const CLASS_OVERLAY = 'mp-level-overlay';
	const CLASS_OPEN = 'mp-level-open';
	const CLASS_PUSHED = 'mp-pushed';

	/**
	 * mlpushmenu.js v1.0.0
	 * http://www.codrops.com
	 *
	 * Licensed under the MIT license.
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * Copyright 2013, Codrops
	 * http://www.codrops.com
	 *
	 * @param {Element} element - The menu element.
	 * @param {Element} trigger - The menu trigger element.
	 * @param {Object}  options - The options object.
	 */
	function mlPushMenu( element, trigger, options ) {
		this.element = element;
		this.trigger = trigger;
		this.options = extend( this.defaults, options );
		this._init();
	}

	mlPushMenu.prototype = {
		defaults: {
			// space between each overlaped level
			levelSpacing: 40,
			// classname for the element (if any) that when clicked closes the current level
			backClass: 'mp-back',
		},
		_init() {
			this.level = 0;
			this.menu = document.getElementById( MENU_ID );
			this.levels = [
				...this.element.getElementsByClassName( CLASS_LEVEL ),
			];
			// save the depth of each of these mp-level elements
			this.levels.forEach( ( element ) => {
				element.setAttribute(
					'data-level',
					getLevelDepth( element, this.element.id, CLASS_LEVEL )
				);
			} );
			// the menu items
			this.menuItems = [ ...this.element.getElementsByTagName( 'li' ) ];
			// if type == "cover" these will serve as hooks to move back to the previous level
			this.levelBack = [
				...this.element.getElementsByClassName(
					this.options.backClass
				),
			];
			// event type (if mobile use touch events)
			// this.eventtype = mobilecheck() ? 'touchstart' : 'click';
			this.eventtype = 'click';
			// initialize / bind the necessary events
			this._initEvents();
		},
		_initEvents() {
			const self = this;

			// the menu should close if clicking somewhere on the body
			const bodyClick = ( element ) => {
				self._resetMenu();
				element.removeEventListener( self.eventtype, bodyClick );
			};

			// open (or close) the menu
			this.trigger.addEventListener( this.eventtype, function ( event ) {
				event.stopPropagation();
				event.preventDefault();
				if ( self.open ) {
					self._resetMenu();
				} else {
					self._openMenu();
					// the menu should close if clicking somewhere on the body (excluding clicks on the menu)
					document.addEventListener(
						self.eventtype,
						function ( newEvent ) {
							if (
								self.open &&
								! newEvent.target.closest( self.element.id )
							) {
								bodyClick( this );
							}
						}
					);
				}
			} );

			// opening a sub level menu
			this.menuItems.forEach( ( menuItem ) => {
				// check if it has a sub level
				const subLevel = menuItem.querySelector( `.${ CLASS_LEVEL }` );
				if ( subLevel ) {
					menuItem
						.querySelector( 'a' )
						.addEventListener( self.eventtype, function ( event ) {
							event.preventDefault();
							const level = closest(
								menuItem,
								CLASS_LEVEL
							).getAttribute( 'data-level' );
							if ( self.level <= level ) {
								event.stopPropagation();
								closest( menuItem, CLASS_LEVEL ).classList.add(
									CLASS_OVERLAY
								);
								self._openMenu( subLevel );
							}
						} );
				}
			} );

			// closing the sub levels :
			// by clicking on the visible part of the level element
			this.levels.forEach( ( element ) => {
				element.setAttribute(
					'data-level',
					getLevelDepth( element, self.element.id, CLASS_LEVEL )
				);
				element.addEventListener( self.eventtype, function ( event ) {
					event.stopPropagation();
					const level = element.getAttribute( 'data-level' );
					if ( self.level > level ) {
						self.level = level;
						self._closeMenu();
					}
				} );
			} );

			// by clicking on a specific element
			this.levelBack.forEach( function ( element ) {
				element.addEventListener( self.eventtype, function ( event ) {
					event.preventDefault();
					const level = closest( element, CLASS_LEVEL ).getAttribute(
						'data-level'
					);

					if ( self.level <= level ) {
						event.stopPropagation();
						self.level =
							closest( element, CLASS_LEVEL ).getAttribute(
								'data-level'
							) - 1;
						return self.level === 0
							? self._resetMenu()
							: self._closeMenu();
					}
				} );
			} );
		},

		_openMenu( subLevel ) {
			// increment level depth
			++this.level;

			// move the main wrapper
			const levelFactor = ( this.level - 1 ) * this.options.levelSpacing;
			this._setTransform( `translate3d(-${ levelFactor }px,0,0)` );

			if ( subLevel ) {
				// reset transform for sublevel
				this._setTransform( '', subLevel );
				// need to reset the translate value for the level menus that have the same level depth and are not open
				for ( const levelEl of this.levels ) {
					if (
						levelEl !== subLevel &&
						! levelEl.classList.contains( CLASS_OPEN )
					) {
						this._setTransform(
							'translate3d(100%,0,0) translate3d(-' +
								-1 * levelFactor +
								'px,0,0)',
							levelEl
						);
					}
				}
			}
			// add class mp-pushed to main wrapper if opening the first time
			if ( this.level === 1 ) {
				this.menu.classList.add( CLASS_PUSHED );
				this.open = true;
			}
			// add class mp-level-open to the opening level element
			( subLevel || this.levels[ 0 ] ).classList.add( CLASS_OPEN );
		},
		// close the menu
		_resetMenu() {
			this._setTransform( 'translate3d(100%,0,0)' );
			this.level = 0;
			// remove class mp-pushed from main wrapper
			this.menu.classList.remove( CLASS_PUSHED );
			this._toggleLevels();
			this.open = false;
		},
		// close sub menus
		_closeMenu() {
			const levelFactor = ( this.level - 1 ) * this.options.levelSpacing;
			this._setTransform( `translate3d(-${ levelFactor }px,0,0)` );
			this._toggleLevels();
		},
		// translate the element
		_setTransform( value, element = this.menu ) {
			requestAnimationFrame( () => {
				element.style.transform = value;
			} );
		},
		// removes classes mp-level-open from closing levels
		_toggleLevels() {
			for ( const levelEl of this.levels ) {
				if ( levelEl.getAttribute( 'data-level' ) >= this.level + 1 ) {
					levelEl.classList.remove( CLASS_OPEN, CLASS_OVERLAY );
				} else if (
					levelEl.getAttribute( 'data-level' ) === this.level
				) {
					levelEl.classList.remove( CLASS_OVERLAY );
				}
			}
		},
	};

	// add to global namespace
	window.mlPushMenu = mlPushMenu;
} )( window );
