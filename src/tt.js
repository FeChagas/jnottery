// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function($) {
    var OBJ_NOTE = 0,
        OBJ_SELECTION = 1,
        OBJ_ELEMENT = 2;

    var last_range = null;
    
    window.tt = function(obj, context) {
        var $obj,
            target,
            obj_type;
        
        if(obj instanceof tt.core.Note) {
            $obj = obj.element;
            target = obj;
            obj_type = OBJ_NOTE;
        } else if(obj.tt_selection && obj.tt_selection instanceof tt.core.Selection) {
            $obj = obj;
            target = obj.tt_selection;
            obj_type = OBJ_SELECTION;
        } else {
            $obj = new $.fn.init(obj, context);
            obj_type = OBJ_ELEMENT;
        }

        return $.extend({}, $obj, {
            tooltip: function(options) {
                var first_note,
                    tooltip,
                    add_note_to = $(this),
                    note_factory = function(content) {
                        return new tt.core.ElementNote(add_note_to, content); 
                    };
                
                last_range && tt.range.clear(last_range);
               
                // stick to one note per element
                switch(obj_type) {
                    case OBJ_NOTE: {
                        first_note = target;
                        break;    
                    }
                    case OBJ_SELECTION: {
                        add_note_to = target.element;
                        last_range = target.range;
            
                        note_factory = function(content) {
                            last_range = null;
                            return new tt.core.SelectionNote(add_note_to, target.range, content); 
                        };
                        
                        break;    
                    }
                    default: { 
                        $.each(tt.core.getNotes($(this)), function(id, note) {
                            if(note instanceof tt.core.ElementNote) {
                                first_note = note; 
                                return false;
                            }
                        });
                    }
                }
                        
                tooltip = tt.tooltip.open($.extend({}, { 
                    root: $(this),
                    edit: (first_note ? first_note.id : undefined),
                    content: (first_note ? first_note.getContent() : ''),
                    init: function(tooltip) {

                        tooltip.on({
                            'btn.edit.click.tt': function() {
                                tt.tooltip.edit(false);    
                            },
                            'btn.submit.click.tt': function() {
                                tt.tooltip.edit(true);
                            },
                            'btn.facebook.click.tt': function() {
                                tt.vendor.facebook(document.URL);
                            },
                            'btn.twitter.click.tt': function() {
                                tt.vendor.bitly(document.URL, function(short_url) {
                                    tt.vendor.twitter(short_url);    
                                });
                            },
                            'btn.link.click.tt': function() {
                                tt.vendor.bitly(document.URL, function(short_url) {
                                    window.prompt('Here is link to this page containing your notes (Ctrl + C to save in clipboard)', short_url);  
                                });
                            },
                            'btn.save.click.tt': function() {
                                var agent = navigator.userAgent.toLowerCase(),
                                    letter = 'D';

                                if(window.opera && window.opera.version() < 9)
                                    letter = 'T';
                                else if(agent.indexOf('konqueror') !== -1)
                                    letter = 'B'; 

                                alert('Your notes are currently encoded in URL. Press ' + (agent.indexOf('mac') !== -1 ? 'Cmd' : 'Ctrl') + ' + ' + letter + ' to bookmark this page and all of your notes at once.');
                            }
                        });
                    }
                }, options));
               
                tooltip.off('submit.tt').on('submit.tt', function(e, tooltip) {
                    if(!tooltip.edit)
                        tooltip.edit = tt.core.addNote(note_factory(tt.tooltip.content()));
                    else
                        tt.core.getNote(add_note_to, tooltip.edit).setContent(tt.tooltip.content()); 
                    
                    tt.core.updateHash();
                });

                if(obj_type === OBJ_SELECTION) {
                    tooltip.off('close.tt').on('close.tt', function(e, tooltip) {
                        if(!tooltip.edit) {
                            tt.range.clear(target.range);
                            last_range = null;
                        }        
                    });
                }

                return tooltip;
            },
            init: function(options) {
                if(!rangy.initialized)
                    rangy.init();
                
                tt.core.init($.extend({}, { root: $(this) }, options));

                if(options && options.vendor)
                    tt.vendor.init(options.vendor);

                return this;
            },
            selection: function() {
                var range = tt.range.getFrom($(this)),
                    result;

                tt.range.apply(range);
                result = tt.range.getElements(range); 
                
                result.tt_selection = new tt.core.Selection($(this), range);
                return result;
            }
        });
    };

})(window.jQuery);