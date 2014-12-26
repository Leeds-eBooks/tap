(function( window ) {
    var Tap = {};

    var utils = {};

    utils.attachEvent = function( element, eventName, callback ) {
        return element.addEventListener( eventName, callback, false );
    };

    utils.fireFakeEvent = function( e, eventName ) {
        return e.target.dispatchEvent( utils.createEvent( eventName ) );
    };

    utils.createEvent = function( name ) {
        var evnt = window.document.createEvent( 'HTMLEvents' );
        evnt.initEvent( name, true, true );
        evnt.eventName = name;

        return evnt;
    };

    utils.getRealEvent = function( e ) {
        return e.originalEvent ?
          ( ( e.originalEvent.touches && e.originalEvent.touches.length ) ?
            e.originalEvent.touches[ 0 ] :
            e ) :
          ( e.touches && e.touches.length ) ?
            e.touches[ 0 ] :
            e;
    };

    var eventMatrix = [{
        // Touchable devices
        test: ( 'propertyIsEnumerable' in window || 'hasOwnProperty' in document ) && ( window.propertyIsEnumerable( 'ontouchstart' ) || document.hasOwnProperty( 'ontouchstart') ),
        events: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend'
        }
    }, {
        // IE10
        test: window.navigator.msPointerEnabled,
        events: {
            start: 'MSPointerDown',
            move: 'MSPointerMove',
            end: 'MSPointerUp'
        }
    }, {
        // Modern device agnostic web
        test: window.navigator.pointerEnabled,
        events: {
            start: 'pointerdown',
            move: 'pointermove',
            end: 'pointerup'
        }
    }];

    Tap.options = {
        eventName: 'tap',
        fingerMaxOffset: 11,
        swipeMaxDelay: 501,
        swipeMaxVertical: 31
    };

    var attachDeviceEvent, init, handlers, deviceEvents,
        coords = {};

    attachDeviceEvent = function( eventName ) {
        return utils.attachEvent( document.body, deviceEvents[ eventName ], handlers[ eventName ] );
    };

    handlers = {
        start: function( e ) {
            e = utils.getRealEvent( e );

            coords.start = [ e.pageX, e.pageY ];
            coords.offset = [ 0, 0 ];
            coords.startTime = Date.now();
        },

        move: function( e ) {
            if (!coords['start'] && !coords['move']) return false;

            e = utils.getRealEvent( e );

            coords.move = [ e.pageX, e.pageY ];
            coords.offset = [
                coords.move[ 0 ] - coords.start[ 0 ],
                coords.move[ 1 ] - coords.start[ 1 ]
            ];
        },

        end: function( e ) {
            var delay,isntScroll,
                ops=Tap.options;

            e = utils.getRealEvent( e );

            console.log("delay "+delay);
            console.log("coords x "+coords.offset[0]);
            console.log("coords y "+coords.offset[1]);

            if (Math.abs(coords.offset[0]) < ops.fingerMaxOffset &&
                Math.abs(coords.offset[1]) < ops.fingerMaxOffset &&
                !utils.fireFakeEvent(e,ops.eventName)) {
              e.preventDefault();
            } else {
              delay=(Date.now()-coords.startTime) < ops.swipeMaxDelay;
              isntScroll=Math.abs(coords.offset[1]) < ops.swipeMaxVertical;

              if (delay && isntScroll &&
                  ops.fingerMaxOffset < coords.offset[0] &&
                  !utils.fireFakeEvent(e,'swiperight')) {
                e.preventDefault();
              }
              else if (delay && isntScroll &&
                       coords.offset[0] < 0-ops.fingerMaxOffset &&
                       !utils.fireFakeEvent(e,'swipeleft')) {
                e.preventDefault();
              }
            }

            coords = {};
        },

        click: function( e ) {
            if ( !utils.fireFakeEvent( e, Tap.options.eventName ) ) {
                return e.preventDefault();
            }
        }
    };

    init = function() {
        var i = eventMatrix.length;

        while ( i-- ) {
            if ( eventMatrix[ i ].test ) {
                deviceEvents = eventMatrix[ i ].events;

                attachDeviceEvent( 'start' );
                attachDeviceEvent( 'move' );
                attachDeviceEvent( 'end' );

                return false;
            }
        }

        return utils.attachEvent( document.body, 'click', handlers[ 'click' ] );
    };

    utils.attachEvent( window, 'load', init );

    window.Tap = Tap;

})( window );