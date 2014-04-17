// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) { 

    // default parameters passed to tooltip's view
    var view_defaults = {
        header: 'Add new note <a>(read more)</a>',
        btn: {
            close: '&#10006;',
            disabled: 'Add note first!',
            facebook: {
                label: 'Share on facebook'
            },
            twitter: {
                label: 'Share on twitter'
            },
            link: {
                label: 'Get direct link to your notes'    
            },
            save: {
                label: 'Save notes in browser'
            },
            submit: {
                label: 'Add note'
            }
        },
        txt: {
            placeholder: 'Type your note here...'
        }
    };

    var defaults = {
        // show tooltip on the right or top
        // left/top/right/bottom/auto
        position: 'auto',

        // position (floating) of arrow pointing on current element
        // plus/minus/center/auto/5px
        arrow: 'auto',

        // position (floating) of main tooltip window
        // plus/minus/center/auto/5px
        window: 'auto',
        
        // ractangular container which limits size and position of tooltip
        // none/$element/'5px 10 5px 100px'
        container: 'none',

        // dimensions of tooltip's window
        width: 0,
        height: 0,
        
        // initial content of textarea
        content: ''
    };

    tt.tooltip = $.extend(tt.tooltip || {}, {
        open: function(options) {
            options = $.extend({}, defaults, options); 

            if(typeof main_view !== 'undefined') {
                $(document.body).append(nano(main_view, view_defaults));     
            }
        }    
    });
})(window.tt, window.jQuery);