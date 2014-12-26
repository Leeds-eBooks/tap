    Tap.options = {
        eventName: 'tap',
        fingerMaxOffset: 11,
        swipeMaxOffset: 81
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
            e = utils.getRealEvent( e );

            if ( Math.abs( coords.offset[ 0 ] ) < Tap.options.fingerMaxOffset && Math.abs( coords.offset[ 1 ] ) < Tap.options.fingerMaxOffset && !utils.fireFakeEvent( e, Tap.options.eventName ) ) {
                e.preventDefault();
            }
            else if ( Tap.options.fingerMaxOffset < coords.offset[ 0 ] && coords.offset[ 0 ] < Tap.options.swipeMaxOffset && !utils.fireFakeEvent( e, 'swiperight' ) ) {
                e.preventDefault();
            }
            else if ( -Tap.options.swipeMaxOffset < coords.offset[ 0 ] && coords.offset[ 0 ] < -Tap.options.swipeMaxOffset && !utils.fireFakeEvent( e, 'swipeleft' ) ) {
                e.preventDefault();
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
