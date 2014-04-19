// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) { 

    var TT_TOOLTIP_WIDTH = 270,
        TT_TOOLTIP_HEIGHT = 170,
        TT_ARROW_SIZE = 20;

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
        // plus/minus/center/5px
        arrow: 'center',

        // position (floating) of main tooltip window
        // plus/minus/center/5px
        window: 'center',
        
        // ractangular container which limits size and position of tooltip
        // none/$element/'5px 10 5px 100px'
        container: 'none',

        // dimensions of tooltip's window
        width: TT_TOOLTIP_WIDTH,
        height: TT_TOOLTIP_HEIGHT,
        
        // initial content of textarea
        content: ''
    };

    var fading_change = 8,
        fading_speed = 200;

    function fadeIn($element) {
        $element
            .css('width', '-=' + fading_change)
            .css('height', '-=' + fading_change)
            .css('top', '+=' + (fading_change/2))
            .css('left', '+=' + (fading_change/2))
            .css('display', 'block')
        .animate({
            width: '+=' + fading_change,
            height: '+=' + fading_change,
            top: '-=' + (fading_change/2),
            left: '-=' + (fading_change/2),
            opacity: 1.0
        }, fading_speed);
    }

    function fadeOut($element) {
        $element.animate({
            width: '-=' + fading_change,
            height: '-=' + fading_change,
            top: '+=' + (fading_change/2),
            left: '+=' + (fading_change/2),
            opacity: 0.0
        }, fading_speed, function() {
            $(this).css('display', 'none');    
        });        
    }

    function initEvents($tooltip) {
        $tooltip.on('tt.close', function() {
            fadeOut($(this));     
        });

        $tooltip.find('.tt-close').on('click', function() {
            $tooltip.trigger('tt.close');    
        });
    }

    tt.tooltip = $.extend(tt.tooltip || {}, {
        open: function(options) {
            if(typeof main_view !== 'undefined') {
                options = $.extend({}, defaults, options); 

                var $tooltip,
                    elem_width = options.root.outerWidth(),
                    elem_height = options.root.outerHeight(),
                    elem_offset = options.root.offset(),
                    tooltip_width = Math.max(options.width, TT_TOOLTIP_WIDTH),
                    tooltip_height = Math.max(options.height, TT_TOOLTIP_HEIGHT),
                    tooltip_pos = options.position,
                    window_width = $(window).width(),
                    window_height = $(window).height(),
                    window_offset = { top: $(window).scrollTop(), left: $(window).scrollLeft() },
                    window_bottom_edge = window_offset.top + window_height,
                    window_right_edge = window_offset.left + window_width;

                if(document.doctype === null || screen.height < parseInt(window_height)) {
                    throw new Error('jNottery: Please specify doctype for your document, it\'s required for height calculation');
                } 

                $(document.body).append(nano(main_view, view_defaults));   
                $tooltip = $('.tt-tooltip');

                if(tooltip_pos === 'auto') {
                        // position where minimum of tooltip is out of the screen
                    var min_cutting,
                        // min space where tooltip is fully visible
                        min_extra_space;
                    
                    $.each({
                        top: (elem_offset.top - window_offset.top) - tooltip_height,
                        left: (elem_offset.left - window_offset.left) - tooltip_width,
                        bottom: (window_bottom_edge - (elem_offset.top + elem_height)) - tooltip_height,
                        right: (window_right_edge - (elem_offset.left + elem_width)) - tooltip_width
                    }, function(pos, space) {
                        if(typeof min_cutting === 'undefined' || space > min_cutting.space)
                            min_cutting = { name: pos, space: space };
                            
                        if((space - TT_ARROW_SIZE) > 0
                            && (typeof min_extra_space === 'undefined' || space < min_extra_space.space))
                            min_extra_space = { name: pos, space: space }; 
                    });
                
                    if(typeof min_extra_space !== 'undefined')
                        min_cutting = min_extra_space;

                    tooltip_pos = min_cutting.name;
                }
    
                var arrow_pos = { top: elem_offset.top, left: elem_offset.left };
            
                if(tooltip_pos === 'top' || tooltip_pos === 'bottom') {
                    if(tooltip_pos === 'bottom')
                        arrow_pos.top += elem_height;
                            
                    switch(options.arrow) {
                        case 'plus': {
                            arrow_pos.left += Math.min(elem_width, window_right_edge - elem_offset.left);
                            break;
                        }
                        case 'minus': {
                            arrow_pos.left += Math.max(0, window_offset.left - elem_offset.left); 
                            break;
                        }
                        case 'center': {
                            arrow_pos.left += Math.floor(elem_width / 2);
                            arrow_pos.left = Math.max(
                                    Math.min(arrow_pos.left, window_right_edge), 
                                    window_offset.left
                            );
                            break;
                        }
                        default: {
                            arrow_pos.left += Math.max(parseInt(options.arrow), 0);
                        }
                    }
                } else {
                    if(tooltip_pos === 'right') 
                        arrow_pos.left += elem_width;

                    switch(options.arrow) {
                        case 'plus': {
                            arrow_pos.top += Math.min(elem_height, window_bottom_edge - elem_offset.top);
                            break;
                        }
                        case 'minus': {
                            arrow_pos.top += Math.max(0, window_offset.top - elem_offset.top); 
                            break;
                        }
                        case 'center': {
                            arrow_pos.top += Math.floor(elem_height / 2);
                            arrow_pos.top = Math.max(
                                    Math.min(arrow_pos.top, window_bottom_edge), 
                                    window_offset.top
                            );
                            break;
                        }
                        default: {
                            arrow_pos.top += Math.max(parseInt(options.arrow), 0);
                        }
                    }
                }

                $tooltip.outerWidth(tooltip_width).outerHeight(tooltip_height);
                initEvents($tooltip);
                fadeIn($tooltip);
            }
        }    
    });
})(window.tt, window.jQuery);