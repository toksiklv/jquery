// Limit scope pollution from any deprecated API
(function() {

var browser = {},
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	oldToggle = jQuery.fn.toggle,
	eventAdd = jQuery.event.add,
	eventRemove = jQuery.event.remove,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	},
	uaMatch = function( ua ) {
		ua = ua.toLowerCase();

		var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
			/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
			[];

		return {
			browser: match[ 1 ] || "",
			version: match[ 2 ] || "0"
		};
	},
	matched = uaMatch( navigator.userAgent );

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

// Remove in 1.9
jQuery.extend({
	attrFn: {},
	deletedIds: [],
	uuid: 0,
	browser: browser,
	uaMatch: uaMatch,
	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	}
});


// Support for .toggle( handler, handler, ... ) (see http://api.jquery.com/toggle-event/)
jQuery.fn.toggle = function( fn, fn2 ) {

	if ( !jQuery.isFunction( fn ) || !jQuery.isFunction( fn2 ) ) {
		return oldToggle.apply( this, arguments );
	}

	// Save reference to arguments for access in closure
	var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

	// link all the functions, so any of them can unbind this click handler
	toggler.guid = guid;
	while ( i < args.length ) {
		args[ i++ ].guid = guid;
	}

	return this.click( toggler );
};


// Support for 'hover' type
jQuery.event.add = function( elem, types, handler, data, selector ){
	if ( types ) {
		types = hoverHack( types );
	}
	eventAdd.call( this, elem, types, handler, data, selector );
};

jQuery.event.remove = function( elem, types, handler, selector, mappedTypes ){
	if ( types ) {
		types = hoverHack( types );
	}
	eventRemove.call( this, elem, types, handler, selector, mappedTypes );
};

})();
