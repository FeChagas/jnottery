// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $, rayson, rangy) {
    rangy.config = {
        alertOnFail: false,
        alertOnWarn: false,
        checkSelectionRanges: true,
        preferTextRange: false
    };
    
    var str = rayson.type.str,
        raw = rayson.type.raw;

    var rootOrder = [ 'version', 'selectors', 'element_notes', 'selection_notes' ];

    var element_selectors = {};

    tt.core = $.extend(tt.core || {}, {
        version: '0.1.0',
        
        // internals
        ID_PREFIX: 'ttid',

        Selection: function(element, range) {
            $.extend(this, {
                element: element,
                range: range
            });
        },    
        
        pendingNotes: {},

        getElementById: function(element_id) {
            return $('.' + this.ID_PREFIX + '-' + element_id); 
        },
        getElementId: function(element) {
            return element.data(this.ID_PREFIX);
        },
        getUniqueId: function(n) {
            return Array.apply(null, Array(n)).map(function() {
                return (Math.random() * 16 | 0).toString(16);
            }).join('');
        },
       
        // public
        addNote: function(note) {
            if(note instanceof this.Note)
                return note.save();
            
            return null;
        },
        getNote: function(element, note_id) {
            var element_notes = this.getNotes(element);

            if($.type(element_notes[note_id]) === 'object')
                return element_notes[note_id];

            return null;
        },
        getNotes: function(element) {
            var unique_id = this.getElementId(element);
            
            if($.type(this.pendingNotes[unique_id]) === 'object')
                return this.pendingNotes[unique_id];
            
            return {}; 
        },
        init: function(options) {
            var hash_decoded,
                elements = [];
           
            options = $.extend({
                hash: window.location.hash.slice(1) 
            }, options);
            
            if(options.hash !== '') {
                hash_decoded = rayson.b64.decode(options.hash, Base64.decode);
                
                hash_decoded = rayson.unserialize(hash_decoded, {
                    // version of encoded data
                    version: str,
                    // encoded selectors
                    selectors: [ raw ],
                    // encoded notes
                    element_notes: [ this.ElementNote.template ],
                    selection_notes: [ this.SelectionNote.template ]
                }, {
                    root: rootOrder,
                    element_notes: this.ElementNote.templateOrder,
                    selection_notes: this.SelectionNote.templateOrder
                });
                
                $.each(hash_decoded.selectors, function(i, selector) {
                    elements.push($.xJQ(selector));
                });
                
                $.each(hash_decoded.element_notes, function(i, note) {
                    var note_obj = new tt.core.ElementNote(
                        elements[note.selector],
                        note.content,
                        note.params
                    );
                    note_obj.save();

                    options.onElementNote && options.onElementNote(note_obj);
                });
                
                $.each(hash_decoded.selection_notes, function(i, note) {
                    var range = tt.range.unserialize(elements[note.selector], {
                        start: note.selection[0],
                        end: note.selection[1]
                    });
                    
                    var note_obj = new tt.core.SelectionNote(
                        elements[note.selector],
                        range,
                        note.content,
                        note.params
                    );
                    tt.range.apply(range, note_obj.save());

                    options.onSelectionNote && options.onSelectionNote(note_obj);
                });
            }

            options.onReady && options.onReady();
        },
        merge: function() {
            var selectors = [],
                current_selector,
                element_notes = [],
                selection_notes = [],
                element_ref,
                class_blacklist = [];
            
            if(!$.isEmptyObject(this.pendingNotes)) {
                $.each(this.pendingNotes, function(element_id, notes) {
                    // calculate selector only once
                    if(!element_selectors[element_id]) {
                        element_ref = tt.core.getElementById(element_id);
                       
                        class_blacklist = [];
                        $.each($(element_ref).attr('class').trim().split(/\s+/), function(index, clas) {
                            // ignore internal binding classes
                            if(clas.substr(0, tt.core.ID_PREFIX.length) === tt.core.ID_PREFIX) {
                                class_blacklist.push(clas);        
                            }
                        });

                        element_selectors[element_id] = element_ref.xJQ({
                            classBlacklist: class_blacklist 
                        });
                    }

                    current_selector = selectors.push(element_selectors[element_id]) - 1;
                    
                    $.each(notes, function(note_id, note) {
                        if(note instanceof tt.core.ElementNote)
                            element_notes.push($.extend({}, note.values(), { selector: current_selector })); 
                        else if(note instanceof tt.core.SelectionNote)
                            selection_notes.push($.extend({}, note.values(), { selector: current_selector }));
                    });
                });
                
                return rayson.b64.encode(rayson.serialize({
                    version: tt.core.version,
                    selectors: selectors,
                    element_notes: element_notes,
                    selection_notes: selection_notes
                }, $.extend({
                        version: str,
                        selectors: raw
                    }, 
                    this.valuesTypes(this.ElementNote),
                    this.valuesTypes(this.SelectionNote)
                ), {
                    root: rootOrder,
                    element_notes: this.ElementNote.templateOrder,
                    selection_notes: this.SelectionNote.templateOrder

                }), Base64.encode);
            }

            return '';
        },
        updateHash: function() {
            var hash = this.merge();
            ($.type(hash) === 'string') && (window.location.hash = hash);
        }
    });

})(window.tt, window.jQuery, window.rayson, window.rangy);